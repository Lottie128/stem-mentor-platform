const Award = require('../models/Award');
const User = require('../models/User');

exports.createAward = async (req, res) => {
  try {
    const { student_id, title, description, icon } = req.body;

    if (!student_id || !title) {
      return res.status(400).json({ message: 'Student ID and title required' });
    }

    const student = await User.findOne({ where: { id: student_id, role: 'STUDENT' } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const award = await Award.create({
      student_id,
      title,
      description,
      icon: icon || '🏆',
      awarded_by: req.user.id
    });

    res.status(201).json(award);
  } catch (error) {
    console.error('Create award error:', error);
    res.status(500).json({ message: 'Failed to create award' });
  }
};

exports.deleteAward = async (req, res) => {
  try {
    const { id } = req.params;

    const award = await Award.findByPk(id);
    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    await award.destroy();
    res.json({ message: 'Award deleted successfully' });
  } catch (error) {
    console.error('Delete award error:', error);
    res.status(500).json({ message: 'Failed to delete award' });
  }
};

exports.getMyAwards = async (req, res) => {
  try {
    const awards = await Award.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: User,
        as: 'admin',
        attributes: ['full_name']
      }],
      order: [['awarded_at', 'DESC']]
    });

    res.json(awards);
  } catch (error) {
    console.error('Get my awards error:', error);
    res.status(500).json({ message: 'Failed to fetch awards' });
  }
};