import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  School as SchoolIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Security as CertificationIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ReactNode;
  features: string[];
  content: string;
}

const templates: Template[] = [
  {
    id: 'nursing-career',
    name: 'Nursing Career Pathway',
    description: 'Complete nursing program pathway with coursework, clinical hours, and NCLEX requirements',
    type: 'career',
    icon: <SchoolIcon />,
    features: [
      'Pre-nursing coursework requirements',
      'Clinical hour tracking',
      'NCLEX examination preparation',
      'Graduation requirements',
    ],
    content: `# Nursing Career Pathway Configuration
# Version: 1.0.0
# Created: ${new Date().toISOString().split('T')[0]}

pathwayInfo:
  id: pathway_nursing_career_2025F
  version: "1.0.0"
  name: Nursing Career Pathway
  type: career
  issuingOrganizationId: org_college
  effectiveDate: "${new Date().toISOString().split('T')[0]}"
  expirationDate: null

requirements:
  prerequisiteCourses:
    taskName: task_coursework_prerequisites
    required: true
    description: "Complete prerequisite courses for nursing program"
    courseList:
      - anatomy_physiology_1
      - anatomy_physiology_2
      - chemistry
      - microbiology
      - psychology
    entities:
      - studentacademic
    fields:
      - studentacademic.courseCode
      - studentacademic.completionStatus

  nursingCoursework:
    taskName: task_coursework_nursing
    required: true
    description: "Complete core nursing courses"
    courseList:
      - nursing_fundamentals
      - medical_surgical_nursing
      - pediatric_nursing
      - psychiatric_nursing
      - obstetric_nursing
    entities:
      - studentacademic
    fields:
      - studentacademic.courseCode
      - studentacademic.completionStatus

  clinicalHours:
    taskName: task_experience_clinical
    required: true
    description: "Complete required clinical hours"
    minimumHours: 800
    entities:
      - studentexperience
    fields:
      - studentexperience.experienceType
      - studentexperience.hours

  nclexExam:
    taskName: task_certification_nclex
    required: true
    description: "Pass NCLEX-RN examination"
    exam: NCLEX-RN
    status: Pass
    entities:
      - studentcertification
    fields:
      - studentcertification.certificationName
      - studentcertification.status
`
  },
  {
    id: 'admission-requirements',
    name: 'College Admission Pathway',
    description: 'Standard college admission requirements with academic and testing prerequisites',
    type: 'admission',
    icon: <AssignmentIcon />,
    features: [
      'GPA requirements',
      'Standardized test scores',
      'Application materials',
      'Deadline tracking',
    ],
    content: `# College Admission Pathway Configuration
# Version: 1.0.0
# Created: ${new Date().toISOString().split('T')[0]}

pathwayInfo:
  id: pathway_college_admission_2025F
  version: "1.0.0"
  name: College Admission Pathway
  type: admission
  issuingOrganizationId: org_college
  effectiveDate: "${new Date().toISOString().split('T')[0]}"
  expirationDate: null

requirements:
  academicRequirements:
    taskName: task_academic_gpa
    required: true
    description: "Maintain minimum GPA requirements"
    minimumGPA: 2.5
    entities:
      - studentacademic
    fields:
      - studentacademic.cumulativeGPA

  standardizedTesting:
    taskName: task_assessment_sat_act
    required: true
    description: "Submit SAT or ACT scores"
    acceptableTests:
      - SAT
      - ACT
    minimumScores:
      SAT: 1200
      ACT: 25
    entities:
      - studentassessment
    fields:
      - studentassessment.testName
      - studentassessment.score

  applicationMaterials:
    taskName: task_application_submission
    required: true
    description: "Submit complete application package"
    requiredDocuments:
      - application_form
      - transcripts
      - personal_statement
      - letters_of_recommendation
    entities:
      - studentapplication
    fields:
      - studentapplication.documentType
      - studentapplication.submissionStatus
`
  },
  {
    id: 'certification-program',
    name: 'Professional Certification',
    description: 'Professional certification pathway with training and examination requirements',
    type: 'certification',
    icon: <CertificationIcon />,
    features: [
      'Training program completion',
      'Professional experience',
      'Certification examination',
      'Continuing education',
    ],
    content: `# Professional Certification Pathway Configuration
# Version: 1.0.0
# Created: ${new Date().toISOString().split('T')[0]}

pathwayInfo:
  id: pathway_professional_cert_2025F
  version: "1.0.0"
  name: Professional Certification Pathway
  type: certification
  issuingOrganizationId: org_certification_body
  effectiveDate: "${new Date().toISOString().split('T')[0]}"
  expirationDate: null

requirements:
  trainingProgram:
    taskName: task_training_completion
    required: true
    description: "Complete approved training program"
    minimumHours: 120
    entities:
      - studenttraining
    fields:
      - studenttraining.programName
      - studenttraining.completionStatus
      - studenttraining.hours

  professionalExperience:
    taskName: task_experience_professional
    required: true
    description: "Document relevant professional experience"
    minimumYears: 2
    entities:
      - studentexperience
    fields:
      - studentexperience.experienceType
      - studentexperience.years

  certificationExam:
    taskName: task_certification_exam
    required: true
    description: "Pass certification examination"
    examName: "Professional Certification Exam"
    passingScore: 70
    entities:
      - studentcertification
    fields:
      - studentcertification.examName
      - studentcertification.score
      - studentcertification.status
`
  },
  {
    id: 'simple-course',
    name: 'Simple Course Pathway',
    description: 'Basic course completion pathway for beginners',
    type: 'course',
    icon: <WorkIcon />,
    features: [
      'Single course tracking',
      'Simple requirements',
      'Easy to understand',
      'Great for beginners',
    ],
    content: `# Simple Course Pathway Configuration
# Version: 1.0.0
# Created: ${new Date().toISOString().split('T')[0]}

pathwayInfo:
  id: pathway_simple_course_2025F
  version: "1.0.0"
  name: Simple Course Pathway
  type: course
  issuingOrganizationId: org_school
  effectiveDate: "${new Date().toISOString().split('T')[0]}"
  expirationDate: null

requirements:
  courseCompletion:
    taskName: task_course_completion
    required: true
    description: "Complete the required course"
    courseCode: "COURSE101"
    minimumGrade: "C"
    entities:
      - studentacademic
    fields:
      - studentacademic.courseCode
      - studentacademic.grade
      - studentacademic.completionStatus

  attendance:
    taskName: task_attendance_requirement
    required: true
    description: "Maintain minimum attendance"
    minimumAttendance: 80
    entities:
      - studentattendance
    fields:
      - studentattendance.attendancePercentage
`
  },
];

interface TemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string) => void;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({ open, onClose, onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate.content);
      onClose();
      setSelectedTemplate(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Choose a Template</Typography>
        <IconButton onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Templates provide a starting point for your YAML configuration. 
            You can customize any template after selection using either the Guided Editor or Code Editor.
          </Typography>
        </Alert>

        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedTemplate?.id === template.id ? 2 : 1,
                  borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    elevation: 4,
                  },
                }}
                onClick={() => handleSelectTemplate(template)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {template.icon}
                    <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
                      {template.name}
                    </Typography>
                    <Chip label={template.type} size="small" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <List dense>
                    {template.features.map((feature, index) => (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {selectedTemplate?.id === template.id && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="primary.main">
                        ✓ Selected
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selectedTemplate && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview: {selectedTemplate.name}
            </Typography>
            <Box
              component="pre"
              sx={{
                backgroundColor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 300,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedTemplate.content.split('\n').slice(0, 20).join('\n')}
              {selectedTemplate.content.split('\n').length > 20 && '\n... (truncated)'}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleUseTemplate}
          variant="contained"
          disabled={!selectedTemplate}
        >
          Use This Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateDialog;
