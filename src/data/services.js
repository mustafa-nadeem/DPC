const sortByTitle = (services) =>
  [...services].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

const gpServicesRaw = [
  {
    slug: 'chest-infection',
    title: 'Chest Infection',
    description: 'Clinical assessment and treatment planning for chest infections, including red-flag screening and follow-up advice.',
    category: 'GP Service',
  },
  {
    slug: 'ear-infections',
    title: 'Ear Infections',
    description: 'Assessment and treatment for ear pain, infection symptoms, and hearing-related concerns with clear recovery guidance.',
    category: 'GP Service',
  },
  {
    slug: 'flu-and-flu-like-symptoms',
    title: 'Flu and Flu-like Symptoms',
    description: 'Same-week review for fever, cough, body aches, and flu-like illness with treatment and safety-net advice.',
    category: 'GP Service',
  },
  {
    slug: 'hay-fever-treatment',
    title: 'Hay Fever Treatment',
    description: 'Fast-access allergy assessment and targeted treatment to manage seasonal symptoms.',
    category: 'GP Service',
  },
  {
    slug: 'hgv-driver-assessment-and-check-ups',
    title: 'HGV Driver Assessment & Check-ups',
    description: 'Focused GP check-ups for HGV drivers, including fitness-to-work review and practical health risk management advice.',
    category: 'GP Service',
  },
  {
    slug: 'immunisations',
    title: 'Immunisations',
    description: 'Travel and routine vaccinations administered by our clinical team at your convenience.',
    category: 'GP Service',
  },
  {
    slug: 'longevity-and-lifestyle-clinic',
    title: 'Longevity & Lifestyle Clinic',
    description: 'Evidence-based health optimisation to help you live longer and feel your best.',
    category: 'GP Service',
  },
  {
    slug: 'menopause-and-female-health',
    title: 'Menopause & Female Health',
    description: 'Specialist support for hormonal health, menopause, and wellbeing at every stage.',
    category: 'GP Service',
  },
  {
    slug: 'routine-blood-tests',
    title: 'Routine Blood Tests',
    description: 'Private routine blood testing with clinician interpretation and follow-up planning where needed.',
    category: 'GP Service',
  },
  {
    slug: 'sick-notes-with-evidence-of-current-illness-or-impairment-provided',
    title: 'Sick Notes (evidence of illness or impairment required)',
    description: 'Clinical review and fit note support where appropriate, based on documented current illness or functional impairment.',
    category: 'GP Service',
  },
  {
    slug: 'travel-clinic',
    title: 'Travel Clinic',
    description: 'Pre-travel health advice, vaccinations, and medication to keep you safe abroad.',
    category: 'GP Service',
  },
  {
    slug: 'weight-loss-clinic',
    title: 'Weight Loss Clinic',
    description: 'Personalised weight management plans with clinical oversight and ongoing support.',
    category: 'GP Service',
  },
];

const skinServicesRaw = [
  {
    slug: 'benign-skin-lesion',
    title: 'Benign Skin Lesion',
    description: 'Safe removal of cysts, lipomas, skin tags, and other benign lesions by our clinicians.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'eczema',
    title: 'Eczema',
    description: 'Specialist diagnosis and treatment plans for eczema flare-ups, itch control, and long-term skin health.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'excessive-sweating',
    title: 'Excessive Sweating',
    description: 'Clinical treatments for hyperhidrosis including topical and injectable options.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'hair-loss',
    title: 'Hair Loss',
    description: 'Diagnosis and treatment of alopecia and other hair loss conditions with ongoing support.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'infantile-acne',
    title: 'Infantile Acne',
    description: 'Gentle, clinician-led care for acne in infants with tailored treatment guidance for parents.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'male-genital-skin-disorders',
    title: 'Male Genital Skin Disorders',
    description: 'Discreet, specialist consultation and treatment for dermatological conditions in men.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'moles',
    title: 'Moles',
    description: 'Expert mole assessment, monitoring, and removal with fast onward referral when needed.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'psoriasis',
    title: 'Psoriasis',
    description: 'Long-term skin condition management with personalised care plans and follow-up.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'skin-cancer',
    title: 'Skin Cancer',
    description: 'Rapid skin cancer screening, diagnosis, and referral pathways with specialist oversight.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'skin-itching-and-its-causes',
    title: 'Skin Itching & its causes',
    description: 'Comprehensive assessment to identify and treat the root causes of persistent skin itching.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'urticaria',
    title: 'Urticaria',
    description: 'Allergy-led assessment and management for chronic or acute hives and skin reactions.',
    category: 'Skin & Dermatology',
  },
  {
    slug: 'vitiligo',
    title: 'Vitiligo',
    description: 'Specialist diagnosis and personalised treatment plans for skin depigmentation.',
    category: 'Skin & Dermatology',
  },
];

export const gpServices = sortByTitle(gpServicesRaw);

export const skinServices = sortByTitle(skinServicesRaw);

export const allServices = [...gpServices, ...skinServices];

export const getServiceBySlug = (slug) => allServices.find((service) => service.slug === slug);

export const getServicePath = (slug) => `/services/${slug}`;

export const getServicePathByTitle = (title) => {
  const service = allServices.find((item) => item.title === title);
  return service ? getServicePath(service.slug) : '/services';
};
