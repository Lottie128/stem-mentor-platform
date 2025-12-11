const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

exports.generateProjectPlan = async (project) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback mock plan if no API key
      return generateMockPlan(project);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const planData = JSON.parse(jsonMatch[0]);
    return planData;
  } catch (error) {
    console.error('AI generation error:', error);
    // Return mock plan as fallback
    return generateMockPlan(project);
  }
};

function generateMockPlan(project) {
  return {
    components: [
      { name: 'Arduino Uno', description: 'Main microcontroller board', quantity: 1, estimated_cost: '₹400' },
      { name: 'Breadboard', description: 'For prototyping connections', quantity: 1, estimated_cost: '₹100' },
      { name: 'Jumper Wires', description: 'Connecting wires', quantity: 20, estimated_cost: '₹50' },
      { name: 'LED', description: 'Light indicators', quantity: 5, estimated_cost: '₹25' }
    ],
    steps: [
      {
        step: 1,
        title: 'Plan and Research',
        description: 'Research similar projects and create a detailed plan with sketches.',
        tag: 'home',
        status: 'not_started'
      },
      {
        step: 2,
        title: 'Gather Components',
        description: 'Purchase or collect all required components and tools.',
        tag: 'home',
        status: 'not_started'
      },
      {
        step: 3,
        title: 'Setup Breadboard Circuit',
        description: 'Connect components on breadboard following circuit diagram.',
        tag: 'center',
        status: 'not_started'
      },
      {
        step: 4,
        title: 'Write and Upload Code',
        description: 'Program the Arduino with required functionality.',
        tag: 'home',
        status: 'not_started'
      },
      {
        step: 5,
        title: 'Test and Debug',
        description: 'Test all features and fix any issues.',
        tag: 'center',
        status: 'not_started'
      },
      {
        step: 6,
        title: 'Final Assembly',
        description: 'Assemble everything into final housing/enclosure.',
        tag: 'center',
        status: 'not_started'
      }
    ],
    safety_notes: `⚠️ Important Safety Notes:\n- All soldering work must be done at the center with supervision\n- Handle electronic components carefully to avoid static damage\n- Double-check all connections before powering on\n- Use proper insulation for all exposed wires\n- Work in a well-ventilated area`
  };
}