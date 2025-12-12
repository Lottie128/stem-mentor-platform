import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Certificate.css';

const CertificateView = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(`/api/certificates/${certificateId}`);
      setCertificate(response.data);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) return <div className="cert-loading">Loading certificate...</div>;
  if (!certificate) return <div className="cert-error">Certificate not found</div>;

  const issueDate = new Date(certificate.issue_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isIBRVerified = certificate.certificate_type === 'IBR';
  const certTitle = {
    'STEM_ORG': 'Certificate of Achievement',
    'IBR': 'India Book of Records Certificate',
    'COMPLETION': 'Certificate of Completion'
  }[certificate.certificate_type] || 'Certificate';

  return (
    <div className="certificate-page">
      <div className="download-controls no-print">
        <button onClick={handleDownloadPDF} className="download-btn">
          💾 Download PDF
        </button>
      </div>

      <div className="certificate-container">
        <div className="certificate-border">
          <div className="certificate-content">
            {/* Top Logos */}
            <div className="cert-header">
              <div className="logo-container">
                <div className="logo stem-logo">
                  <div className="logo-text">STEM.org</div>
                  <div className="logo-subtitle">Educational Outreach</div>
                </div>
                <div className="logo zeroai-logo">
                  <div className="logo-text">ZeroAI</div>
                  <div className="logo-subtitle">Technologies Inc.</div>
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="cert-title-section">
              <h1 className="cert-title">{certTitle}</h1>
              {isIBRVerified && (
                <div className="ibr-badge">
                  <span className="ibr-icon">🇮🇳</span>
                  <span>India Book of Records Verified</span>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="cert-body">
              <p className="cert-presented">This certificate is proudly presented to</p>
              <h2 className="cert-student-name">{certificate.student.full_name}</h2>
              
              <p className="cert-description">
                For successfully completing the STEM project
              </p>
              
              <h3 className="cert-project-title">{certificate.project.title}</h3>
              
              <p className="cert-details">
                Project Type: <strong>{certificate.project.type}</strong><br/>
                Completion Date: <strong>{issueDate}</strong>
              </p>

              {isIBRVerified && (
                <div className="cert-ibr-verification">
                  <p>✅ This project has been verified and recognized by the <strong>India Book of Records</strong></p>
                  <p>Record Category: Outstanding STEM Innovation by Youth</p>
                </div>
              )}
            </div>

            {/* Certificate Number & Verification */}
            <div className="cert-verification">
              <div className="cert-number-box">
                <span className="cert-label">Certificate No.</span>
                <span className="cert-number">{certificate.certificate_number}</span>
              </div>
              <div className="cert-code-box">
                <span className="cert-label">Verification Code</span>
                <span className="cert-code">{certificate.verification_code}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="cert-signatures">
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-name">Dr. Lottie Mukuka</p>
                <p className="signature-title">CEO, ZeroAI Technologies Inc.</p>
                <p className="signature-affiliation">STEM.org Certified Educator</p>
              </div>
              
              <div className="cert-seal">
                <div className="seal-circle">
                  <div className="seal-inner">
                    <div className="seal-star">★</div>
                    <div className="seal-text">STEM</div>
                    <div className="seal-year">2025</div>
                  </div>
                </div>
              </div>
              
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-name">STEM.org</p>
                <p className="signature-title">Educational Partner</p>
                <p className="signature-affiliation">International STEM Certification</p>
              </div>
            </div>

            {/* Footer */}
            <div className="cert-footer">
              <p>This certificate verifies the successful completion of a hands-on STEM project under professional mentorship.</p>
              <p className="cert-verify-url">Verify at: stem-mentor.zeroai.tech/verify/{certificate.verification_code}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;