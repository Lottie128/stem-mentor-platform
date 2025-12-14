require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Log API key status on startup
console.log('\n🔑 Gemini API Key Status:');
if (!GEMINI_API_KEY) {
  console.log('   ❌ NOT SET - using mock plans');
} else if (GEMINI_API_KEY === 'my key' || GEMINI_API_KEY.length < 20) {
  console.log('   ⚠️  INVALID KEY - Replace with actual API key');
  console.log('   📍 Get your key at: https://aistudio.google.com/app/apikey');
} else {
  console.log('   ✅ CONFIGURED - Key length:', GEMINI_API_KEY.length);
  console.log('   🚀 AI generation enabled with Gemini 2.5 Flash!');
}
console.log('');

const genAI = (GEMINI_API_KEY && GEMINI_API_KEY !== 'my key' && GEMINI_API_KEY.length > 20) 
  ? new GoogleGenerativeAI(GEMINI_API_KEY) 
  : null;

exports.generateProjectPlan = async (project) => {
  try {
    if (!genAI) {
      console.log('❌ No valid Gemini API key - using mock plan');
      return generateMockPlan(project);
    }

    console.log('🤖 Generating AI plan using Gemini 2.5 Flash...');
    console.log('   Project:', project.title);
    console.log('   Type:', project.type);
    console.log('   Experience:', project.experience_level);
    
    // Use Gemini 2.5 Flash (latest stable model as of December 2025)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `You are a STEM education expert. Generate a detailed, safe, and realistic project plan for a student.

Project Details:
- Title: ${project.title}
- Type: ${project.type}
- Purpose: ${project.purpose}
- Experience Level: ${project.experience_level}
- Available Tools: ${project.available_tools || 'Basic tools only'}
- Budget: ${project.budget_range}

Generate a JSON response with this EXACT structure (no markdown, just JSON):
{
  "components": [
    {"name": "Arduino Uno", "description": "Main microcontroller", "quantity": 1, "estimated_cost": "₹400"}
  ],
  "steps": [
    {
      "step": 1,
      "title": "Research Phase",
      "description": "Study similar projects and gather requirements",
      "tag": "home",
      "status": "not_started"
    }
  ],
  "safety_notes": "Important safety considerations"
}

Rules:
- Steps appropriate for ${project.experience_level} level
- Tag: "home" (safe alone) or "center" (needs supervision)
- Budget: ${project.budget_range}
- Include 6-10 clear, actionable steps
- Include 4-8 realistic components with costs in ₹
- Focus on safety and education
- Return ONLY valid JSON`;

    console.log('📤 Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Received AI response, parsing...');

    // Extract JSON from response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.includes('```')) {
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
    }

    // Find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Could not find JSON in response');
      console.error('Response text:', text.substring(0, 200));
      throw new Error('Could not parse AI response');
    }

    const planData = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!planData.components || !planData.steps || !Array.isArray(planData.components) || !Array.isArray(planData.steps)) {
      console.error('❌ Invalid plan structure');
      throw new Error('Invalid plan structure from AI');
    }

    console.log('✅ AI plan generated successfully!');
    console.log('   Components:', planData.components.length);
    console.log('   Steps:', planData.steps.length);
    console.log('   Safety notes:', planData.safety_notes ? 'Yes' : 'No');
    
    return planData;
    
  } catch (error) {
    console.error('❌ AI generation error:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('🔑 API key error - please verify your key');
      console.error('   Check: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('quota')) {
      console.error('⚠️  API quota exceeded - check your usage');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('🔒 Permission denied - API key may not have access to Gemini API');
      console.error('   Make sure Gemini API is enabled for your key');
    } else if (error.message.includes('not found') || error.message.includes('404')) {
      console.error('🔄 Model not available - using fallback');
      console.error('   Try: gemini-2.0-flash or check https://ai.google.dev/gemini-api/docs/models');
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
  } else if (projectType.includes('iot') || projectType.includes('smart')) {
    components = [
      { name: 'ESP32', description: 'WiFi-enabled microcontroller', quantity: 1, estimated_cost: '₹500' },
      { name: 'DHT22 Sensor', description: 'Temperature and humidity sensor', quantity: 1, estimated_cost: '₹200' },
      { name: 'Relay Module', description: '4-channel relay for controlling devices', quantity: 1, estimated_cost: '₹180' },
      { name: 'LED Indicators', description: 'Status indication LEDs', quantity: 5, estimated_cost: '₹25' },
      { name: 'Breadboard & Wires', description: 'For prototyping', quantity: 1, estimated_cost: '₹150' },
      { name: 'Power Supply', description: '5V 2A adapter', quantity: 1, estimated_cost: '₹200' }
    ];
    steps = [
      { step: 1, title: 'Plan IoT System', description: 'Design the system architecture and identify sensors needed.', tag: 'home', status: 'not_started' },
      { step: 2, title: 'Setup Development Environment', description: 'Install Arduino IDE and ESP32 board support.', tag: 'home', status: 'not_started' },
      { step: 3, title: 'Wire Sensors', description: 'Connect sensors to ESP32 on breadboard.', tag: 'center', status: 'not_started' },
      { step: 4, title: 'Test Sensor Reading', description: 'Write code to read sensor data and display on serial monitor.', tag: 'center', status: 'not_started' },
      { step: 5, title: 'Setup WiFi Connection', description: 'Configure ESP32 to connect to WiFi network.', tag: 'home', status: 'not_started' },
      { step: 6, title: 'Implement Control Logic', description: 'Program the automation logic based on sensor readings.', tag: 'home', status: 'not_started' },
      { step: 7, title: 'Build Web Interface', description: 'Create simple web dashboard to monitor and control.', tag: 'center', status: 'not_started' },
      { step: 8, title: 'Final Testing', description: 'Test entire system and fix bugs.', tag: 'center', status: 'not_started' }
    ];
  } else {
    components = [
      { name: 'Arduino Uno', description: 'Main microcontroller board', quantity: 1, estimated_cost: '₹400' },
      { name: 'Breadboard', description: 'For prototyping connections', quantity: 1, estimated_cost: '₹100' },
      { name: 'Jumper Wires', description: 'Connecting wires', quantity: 20, estimated_cost: '₹50' },
      { name: 'LED', description: 'Light indicators', quantity: 5, estimated_cost: '₹25' },
      { name: 'Resistors', description: '220Ω resistors', quantity: 5, estimated_cost: '₹10' }
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