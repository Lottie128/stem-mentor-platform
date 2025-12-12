const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Project = require('../models/Project');
const crypto = require('crypto');

exports.generateCertificate = async (req, res) => {
  try {
    const { student_id, project_id, certificate_type } = req.body;

    // Check if certificate already exists
    const existing = await Certificate.findOne({
      where: { student_id, project_id, certificate_type }
    });

    if (existing) {
      return res.status(400).json({ message: 'Certificate already exists for this project' });
    }

    // Generate unique certificate number
    const certNumber = `STEM-${certificate_type}-${Date.now()}-${student_id}`;
    const verificationCode = crypto.randomBytes(16).toString('hex');

    const certificate = await Certificate.create({
      student_id,
      project_id,
      certificate_type,
      certificate_number: certNumber,
      verification_code: verificationCode,
      issue_date: new Date()
    });

    res.status(201).json(certificate);
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
};

exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: Project,
        as: 'project',
        attributes: ['title', 'type']
      }],
      order: [['issue_date', 'DESC']]
    });

    res.json(certificates);
  } catch (error) {
    console.error('Get my certificates error:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await Certificate.findOne({
      where: { verification_code: code },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['full_name']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['title', 'type']
        }
      ]
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found', valid: false });
    }

    res.json({
      valid: true,
      certificate: {
        student_name: certificate.student.full_name,
        project_title: certificate.project.title,
        project_type: certificate.project.type,
        certificate_number: certificate.certificate_number,
        issue_date: certificate.issue_date,
        certificate_type: certificate.certificate_type
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Failed to verify certificate' });
  }
};