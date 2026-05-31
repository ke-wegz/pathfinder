const { db, admin } = require('./firebase');

const resources = [
  {
    name: 'Coursera: Google Data Analytics Professional Certificate',
    provider: 'Coursera',
    type: 'course',
    topics: ['data analytics', 'business intelligence', 'spreadsheet'],
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics'
  },
  {
    name: 'Udemy: Complete JavaScript Course 2025',
    provider: 'Udemy',
    type: 'course',
    topics: ['javascript', 'web development', 'programming'],
    url: 'https://www.udemy.com/course/the-complete-javascript-course/'
  },
  {
    name: 'edX: CS50 Introduction to Computer Science',
    provider: 'edX',
    type: 'course',
    topics: ['computer science', 'programming', 'algorithms'],
    url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science'
  },
  {
    name: 'LinkedIn Learning: Learning UX Design',
    provider: 'LinkedIn Learning',
    type: 'course',
    topics: ['ux design', 'product design', 'user research'],
    url: 'https://www.linkedin.com/learning/learning-ux-design-2'
  },
  {
    name: 'freeCodeCamp: Responsive Web Design Certification',
    provider: 'freeCodeCamp',
    type: 'certification',
    topics: ['html', 'css', 'web design'],
    url: 'https://www.freecodecamp.org/learn/responsive-web-design/'
  },
  {
    name: 'Khan Academy: Computer Programming',
    provider: 'Khan Academy',
    type: 'course',
    topics: ['javascript', 'computing', 'algorithms'],
    url: 'https://www.khanacademy.org/computing/computer-programming'
  },
  {
    name: 'Google Cloud Skill Boosts: Machine Learning with TensorFlow',
    provider: 'Google Cloud',
    type: 'course',
    topics: ['machine learning', 'tensorflow', 'ai'],
    url: 'https://www.cloudskillsboost.google/quests/80'
  },
  {
    name: 'MIT OpenCourseWare: Introduction to Computer Science and Programming in Python',
    provider: 'MIT OpenCourseWare',
    type: 'course',
    topics: ['python', 'programming', 'computer science'],
    url: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/'
  },
  {
    name: 'AWS Skill Builder: Introduction to Cloud Computing',
    provider: 'AWS',
    type: 'course',
    topics: ['cloud computing', 'aws', 'infrastructure'],
    url: 'https://explore.skillbuilder.aws/learn/course/30252/introduction-to-cloud-computing'
  },
  {
    name: 'Smashing Magazine: Product Design Resources',
    provider: 'Smashing Magazine',
    type: 'article',
    topics: ['product design', 'ui', 'ux'],
    url: 'https://www.smashingmagazine.com/category/product-design/'
  }
];

const seedResources = async () => {
  try {
    const batch = db.batch();
    resources.forEach((resource) => {
      const docRef = db.collection('learning_resources').doc();
      batch.set(docRef, {
        ...resource,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();
    console.log('Seeded learning_resources collection with', resources.length, 'documents');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed resources:', error);
    process.exit(1);
  }
};

seedResources();
