require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Log API key status on startup
console.log('\n🔑 Gemini API Key Status:');
if (!GEMINI_API_KEY) {
  console.log('   ❌ NOT SET - using mock plans');
} else if (GEMINI_API_KEY === 'my key') {
  console.log('   ⚠️  PLACEHOLDER DETECTED - Replace "my key" with actual API key');
  console.log('   📍 Get your key at: https://aistudio.google.com/app/apikey');
} else if (GEMINI_API_KEY.length < 20) {
  console.log('   ⚠️  KEY TOO SHORT - likely invalid');
} else {
  console.log('   ✅ CONFIGURED - Key length:', GEMINI_API_KEY.length);
  console.log('   🚀 AI generation enabled!');
}
console.log('');

const genAI = (GEMINI_API_KEY && GEMINI_API_KEY !== 'my key') ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

exports.generateProjectPlan = async (project) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'my key' || !genAI) {
      console.log('❌ No valid Gemini API key - using mock plan');
      if (GEMINI_API_KEY === 'my key') {
        console.log('⚠️  Please replace "my key" in .env with actual API key from https://aistudio.google.com/app/apikey');
      }
      return generateMockPlan(project);
    }

    console.log('🤖 Generating AI plan using Gemini 2.0 Flash...');
    console.log('   Project:', project.title);
    console.log('   Type:', project.type);
    console.log('   Experience:', project.experience_level);
    
    // Use Gemini 2.0 Flash (latest model as of December 2024)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `
You are a STEM education expert. Generate a detailed, safe, and realistic project plan for a student.

Project Details:
- Title: ${project.title}
- Type: ${project.type}
- Purpose: ${project.purpose}
- Experience Level: ${project.experience_level}
- Available Tools: ${project.available_tools || 'Basic tools only'}
- Budget: ${project.budget_range}

Generate a JSON response with this exact structure:
{
  "components": [
    {"name": "Component name", "description": "Brief description", "quantity": 1, "estimated_cost": "₹XXX"}
  ],
  "steps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed instructions",
      "tag": "home" or "center",
      "status": "not_started"
    }
  ],
  "safety_notes": "Important safety considerations for this project. Mark any steps requiring supervision."
}

IMPORTANT:
- Make steps appropriate for ${project.experience_level} level
- Tag steps as "home" (safe to do alone) or "center" (needs supervision)
- Consider the budget constraint: ${project.budget_range}
- Be realistic and practical
- Include 5-10 clear steps
- Include 3-8 components
- Focus on educational value and safety
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Received AI response');

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Could not parse AI response');
      throw new Error('Could not parse AI response');
    }

    const planData = JSON.parse(jsonMatch[0]);
    console.log('✅ AI plan generated successfully!');
    console.log('   Components:', planData.components.length);
    console.log('   Steps:', planData.steps.length);
    return planData;
  } catch (error) {
    console.error('❌ AI generation error:', error.message);
    if (error.message.includes('API key')) {
      console.error('🔑 API key error - please verify your key at https://aistudio.google.com/app/apikey');
    }
    console.log('📦 Falling back to mock plan');
    return generateMockPlan(project);
  }
};

function generateMockPlan(project) {
  console.log('📦 Generating mock plan for:', project.title);
  
  const projectType = project.type.toLowerCase();
  let components, steps;

  if (projectType.includes('robot')) {
    components = [
      { name: 'Arduino Uno', description: 'Main microcontroller board', quantity: 1, estimated_cost: '₹400' },
      { name: 'Motor Driver L298N', description: 'Controls DC motors', quantity: 1, estimated_cost: '₹150' },
      { name: 'DC Motors', description: 'For robot movement', quantity: 2, estimated_cost: '₹200' },
      { name: 'Ultrasonic Sensor', description: 'For obstacle detection', quantity: 1, estimated_cost: '₹100' },
      { name: 'Chassis & Wheels', description: 'Robot body and wheels', quantity: 1, estimated_cost: '₹250' },
      { name: 'Battery Pack', description: '9V or 12V power supply', quantity: 1, estimated_cost: '₹150' }
    ];
    steps = [
      { step: 1, title: 'Research and Design', description: 'Study similar robots and sketch your design with measurements.', tag: 'home', status: 'not_started' },
      { step: 2, title: 'Gather Components', description: 'Purchase all components from electronics store or online.', tag: 'home', status: 'not_started' },
      { step: 3, title: 'Assemble Chassis', description: 'Mount motors and wheels to the robot chassis.', tag: 'center', status: 'not_started' },
      { step: 4, title: 'Wire Motor Driver', description: 'Connect motor driver to Arduino and motors following circuit diagram.', tag: 'center', status: 'not_started' },
      { step: 5, title: 'Install Sensors', description: 'Mount ultrasonic sensor at front and connect to Arduino.', tag: 'center', status: 'not_started' },
      { step: 6, title: 'Program Arduino', description: 'Write code for obstacle avoidance and motor control.', tag: 'home', status: 'not_started' },
      { step: 7, title: 'Test and Debug', description: 'Test each function separately, then together. Fix any issues.', tag: 'center', status: 'not_started' },
      { step: 8, title: 'Final Assembly', description: 'Secure all components and add battery pack.', tag: 'center', status: 'not_started' }
    ];
  } else {
    components = [
      { name: 'Arduino Uno', description: 'Main microcontroller board', quantity: 1, estimated_cost: '₹400' },
      { name: 'Breadboard', description: 'For prototyping connections', quantity: 1, estimated_cost: '₹100' },
      { name: 'Jumper Wires', description: 'Connecting wires', quantity: 20, estimated_cost: '₹50' },
      { name: 'LED', description: 'Light indicators', quantity: 5, estimated_cost: '₹25' }
    ];
    steps = [
      { step: 1, title: 'Plan and Research', description: 'Research similar projects and create a detailed plan with sketches.', tag: 'home', status: 'not_started' },
      { step: 2, title: 'Gather Components', description: 'Purchase or collect all required components and tools.', tag: 'home', status: 'not_started' },
      { step: 3, title: 'Setup Breadboard Circuit', description: 'Connect components on breadboard following circuit diagram.', tag: 'center', status: 'not_started' },
      { step: 4, title: 'Write and Upload Code', description: 'Program the Arduino with required functionality.', tag: 'home', status: 'not_started' },
      { step: 5, title: 'Test and Debug', description: 'Test all features and fix any issues.', tag: 'center', status: 'not_started' },
      { step: 6, title: 'Final Assembly', description: 'Assemble everything into final housing/enclosure.', tag: 'center', status: 'not_started' }
    ];
  }

  return {
    components,
    steps,
    safety_notes: `⚠️ Important Safety Notes:\n- All soldering work must be done at the center with supervision\n- Handle electronic components carefully to avoid static damage\n- Double-check all connections before powering on\n- Use proper insulation for all exposed wires\n- Work in a well-ventilated area\n- Wear safety goggles when cutting or drilling`
  };
}