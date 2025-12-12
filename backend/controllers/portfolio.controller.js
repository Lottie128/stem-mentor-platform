const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const Award = require('../models/Award');

exports.getPublicPortfolio = async (req, res) => {
  try {
    const { slug } = req.params;

    const portfolio = await Portfolio.findOne({
      where: { slug, is_public: true },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['full_name', 'email']
        }
      ]
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found or not public' });
    }

    // Get completed projects
    const projects = await Project.findAll({
      where: { 
        student_id: portfolio.student_id,
        status: 'COMPLETED'
      },
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }],
      attributes: ['id', 'title', 'type', 'created_at']
    });

    // Get awards
    const awards = await Award.findAll({
      where: { student_id: portfolio.student_id },
      attributes: ['title', 'description', 'icon', 'awarded_at'],
      order: [['awarded_at', 'DESC']]
    });

    res.json({
      ...portfolio.toJSON(),
      projects,
      awards
    });
  } catch (error) {
    console.error('Get public portfolio error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
};

exports.getMyPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({
      where: { student_id: req.user.id }
    });

    if (!portfolio) {
      // Create default portfolio
      const slug = `${req.user.full_name.toLowerCase().replace(/\s+/g, '-')}-${req.user.id}`;
      portfolio = await Portfolio.create({
        student_id: req.user.id,
        slug,
        bio: '',
        skills: [],
        social_links: {},
        is_public: false
      });
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Get my portfolio error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
};

exports.updatePortfolio = async (req, res) => {
  try {
    const { bio, skills, social_links, is_public, theme_color } = req.body;

    let portfolio = await Portfolio.findOne({
      where: { student_id: req.user.id }
    });

    if (!portfolio) {
      const slug = `${req.user.full_name.toLowerCase().replace(/\s+/g, '-')}-${req.user.id}`;
      portfolio = await Portfolio.create({
        student_id: req.user.id,
        slug,
        bio,
        skills,
        social_links,
        is_public,
        theme_color
      });
    } else {
      portfolio.bio = bio !== undefined ? bio : portfolio.bio;
      portfolio.skills = skills !== undefined ? skills : portfolio.skills;
      portfolio.social_links = social_links !== undefined ? social_links : portfolio.social_links;
      portfolio.is_public = is_public !== undefined ? is_public : portfolio.is_public;
      portfolio.theme_color = theme_color !== undefined ? theme_color : portfolio.theme_color;
      await portfolio.save();
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({ message: 'Failed to update portfolio' });
  }
};