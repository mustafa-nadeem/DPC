import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import { getServiceBySlug } from '../data/services';

const buildExtendedSections = (service) => {
  const isSkinService = service.category === 'Skin & Dermatology';

  const whoItHelpsBullets = isSkinService
    ? [
      'Patients with persistent or recurring skin symptoms',
      'Patients who want specialist assessment of diagnosis or treatment response',
      'Patients seeking a clear management plan and follow-up timeline',
      'Patients who want private, same-week access to dermatology-led review',
    ]
    : [
      'Patients needing same-week private GP review',
      'Patients with ongoing symptoms needing diagnosis and treatment planning',
      'Patients who need referrals, tests, or second opinions',
      'Patients wanting continuity of care with a clear follow-up plan',
    ];

  const assessmentBullets = isSkinService
    ? [
      'Detailed symptom and treatment history',
      'Examination of affected areas and symptom pattern',
      'Review of triggers, flare cycles, and treatment response',
      'Clear advice on next-step investigations or referral, where indicated',
    ]
    : [
      'Focused clinical history and risk assessment',
      'Targeted examination and review of prior results',
      'Medication and lifestyle review where relevant',
      'Investigation and referral planning when needed',
    ];

  const treatmentBullets = isSkinService
    ? [
      'Stepwise treatment planning based on severity and clinical response',
      'Prescription, procedural, or specialist options when appropriate',
      'Flare-prevention and long-term maintenance strategies',
      'Escalation to specialist pathways for complex presentations',
    ]
    : [
      'Diagnosis-led treatment planning in line with current guidance',
      'Medication optimisation and monitoring where clinically indicated',
      'Lifestyle and risk-factor interventions to support outcomes',
      'Structured onward referral for specialist care when required',
    ];

  const preparationBullets = [
    'Bring a current medication list (including supplements)',
    'Bring previous test results or letters if available',
    'Note key symptom dates, triggers, and prior treatments',
    'Prepare questions so your consultation can focus on decisions that matter most',
  ];

  const urgentReviewBullets = isSkinService
    ? [
      'Rapidly worsening symptoms, severe pain, or spreading inflammation',
      'New bleeding, ulceration, or unexpectedly changing lesions',
      'Systemic symptoms with skin changes (fever, severe unwellness)',
      'Any symptom change you are concerned about that is not settling',
    ]
    : [
      'Worsening symptoms that are severe, persistent, or function-limiting',
      'New red-flag symptoms such as chest pain, breathing difficulty, or neurological changes',
      'Medication reactions, side effects, or concerns requiring rapid review',
      'Any sudden change where you feel your condition is deteriorating',
    ];

  const resourceLinks = isSkinService
    ? [
      { label: 'NHS: Skin conditions (A to Z)', href: 'https://www.nhs.uk/conditions/' },
      { label: 'British Association of Dermatologists: Patient Hub', href: 'https://www.skinhealthinfo.org.uk/' },
      { label: 'NICE: Skin conditions guidance', href: 'https://www.nice.org.uk/guidance/conditions-and-diseases/skin-conditions' },
    ]
    : [
      { label: 'NHS: GP appointments and services', href: 'https://www.nhs.uk/nhs-services/gps/' },
      { label: 'NHS: Conditions and symptoms (A to Z)', href: 'https://www.nhs.uk/conditions/' },
      { label: 'NICE: Conditions and diseases guidance', href: 'https://www.nice.org.uk/guidance/conditions-and-diseases' },
    ];

  return [
    {
      id: 'overview',
      title: 'Overview',
      paragraphs: [
        `${service.title} at Daventry Clinic provides structured, consultant-informed care with clear clinical reasoning and practical next steps.`,
        service.description,
        'Our approach combines detailed assessment, evidence-based planning, and consistent follow-up so you know what is happening at each stage of care.',
      ],
    },
    {
      id: 'who-this-service-is-for',
      title: 'Who This Service Is For',
      paragraphs: [
        `This service is suitable for patients who need timely, private assessment for ${service.title.toLowerCase()} concerns and want a clear management pathway.`,
      ],
      bullets: whoItHelpsBullets,
    },
    {
      id: 'how-we-assess',
      title: 'How We Assess',
      paragraphs: [
        'Consultations are designed to move from symptom review to diagnosis planning efficiently, without sacrificing detail or patient understanding.',
        'Where appropriate, we coordinate tests, imaging, or specialist input and explain both urgency and expected timelines clearly.',
      ],
      bullets: assessmentBullets,
    },
    {
      id: 'treatment-pathways',
      title: 'Treatment Pathways',
      paragraphs: [
        'Your treatment plan is individualised to severity, risk factors, and previous treatment response. We balance symptom control with long-term outcomes and safety.',
      ],
      bullets: treatmentBullets,
    },
    {
      id: 'follow-up-and-monitoring',
      title: 'Follow-Up & Monitoring',
      paragraphs: [
        'Follow-up is planned from the first visit so progress is measured rather than assumed. We define review windows, expected milestones, and what changes should trigger earlier reassessment.',
        'If your condition needs escalation, we coordinate onward referral and provide continuity so nothing gets lost between services.',
      ],
    },
    {
      id: 'preparing-for-your-appointment',
      title: 'Preparing For Your Appointment',
      paragraphs: [
        'A little preparation helps make your consultation more productive and ensures we can make decisions quickly.',
      ],
      bullets: preparationBullets,
    },
    {
      id: 'when-to-seek-urgent-review',
      title: 'When To Seek Urgent Review',
      paragraphs: [
        'If symptoms worsen unexpectedly or red-flag features appear, seek urgent clinical advice rather than waiting for routine follow-up.',
      ],
      bullets: urgentReviewBullets,
      note: 'If you think symptoms are severe or potentially emergency-related, use emergency services immediately.',
    },
    {
      id: 'common-questions',
      title: 'Common Questions',
      paragraphs: [
        `How many appointments will I need? This depends on diagnostic complexity and treatment response; many patients benefit from an initial review plus a planned follow-up.`,
        'Can I be referred onward if needed? Yes. We coordinate specialist referrals when indicated and explain urgency and options clearly.',
        'Will I receive a written plan? Yes. We aim to provide clear post-consultation guidance so next steps are easy to follow.',
      ],
    },
    {
      id: 'research-and-guidance',
      title: 'Research & Guidance',
      paragraphs: [
        'This page content follows the same evidence-informed structure used across our services. Final clinical decisions are always individualised during consultation.',
      ],
      links: resourceLinks,
    },
  ];
};

const dermnetServiceProfiles = {
  'benign-skin-lesion': {
    overview: [
      'Benign skin lesions are non-cancerous growths that are common across all age groups and skin types.',
      'Typical benign patterns are usually symmetrical, slowly changing, and without spontaneous ulceration or bleeding.',
      'Examples include seborrhoeic keratoses, skin tags, cysts, dermatofibromas, and benign melanocytic lesions.',
    ],
    features: [
      'Stable or slowly evolving appearance over time',
      'More regular borders and more even colour pattern',
      'Often asymptomatic, though friction can cause irritation',
      'Cosmetic concern is common even when lesions are medically benign',
    ],
    assessment: [
      'Visual and dermatoscopic examination to confirm benign pattern',
      'Review of change history, symptoms, and risk factors',
      'Biopsy/excision if lesion appears atypical or diagnosis is uncertain',
    ],
    treatment: [
      'Reassurance and monitoring when lesion is clearly benign',
      'Removal for irritation, recurrent trauma, or cosmetic preference',
      'Histology where diagnosis needs confirmation',
    ],
    followup: [
      'Patients are advised to return if lesions change, bleed, ulcerate, or become persistently painful.',
      'Self-monitoring is important, especially if you have many pigmented lesions.',
    ],
    urgent: [
      'Rapid recent growth or new asymmetry',
      'Persistent ulceration or spontaneous bleeding',
      'Marked colour change or new irregular border',
    ],
    links: [
      { label: 'DermNet: Common benign skin lesions', href: 'https://dermnetnz.org/topics/benign-skin-lesions' },
      { label: 'DermNet: Melanocytic naevus (mole)', href: 'https://dermnetnz.org/topics/melanocytic-naevus' },
    ],
  },
  eczema: {
    overview: [
      'Eczema (most commonly atopic dermatitis) is a chronic, relapsing inflammatory skin condition characterised by dryness, itch, and flares.',
      'It often reflects a combination of barrier dysfunction, immune dysregulation, and environmental triggers.',
      'Symptoms and distribution can vary by age, skin type, and disease stage.',
    ],
    features: [
      'Persistent itch with periods of flare and remission',
      'Dry, sensitive skin with patchy redness or inflammation',
      'Lichenification (thickened skin) in chronic scratch-prone areas',
      'Sleep disturbance and quality-of-life impact in moderate/severe disease',
    ],
    assessment: [
      'Clinical diagnosis based on history, distribution, and morphology',
      'Trigger review (irritants, allergens, climate, stress, infection)',
      'Patch testing when disease becomes treatment-resistant or atypical',
    ],
    treatment: [
      'Daily emollient-based skin barrier care',
      'Topical anti-inflammatory treatment during flares',
      'Escalation to phototherapy or systemic options for severe/refractory disease',
    ],
    followup: [
      'Long-term management focuses on relapse prevention and early flare treatment.',
      'Follow-up plans include practical routines for skin care, trigger control, and treatment tapering where appropriate.',
    ],
    urgent: [
      'Rapidly worsening painful flare with oozing/crusting',
      'Possible secondary infection (fever, spreading redness, tenderness)',
      'Herpetic-appearing lesions or sudden severe deterioration',
    ],
    links: [
      { label: 'DermNet: Atopic dermatitis', href: 'https://dermnetnz.org/topics/atopic-dermatitis' },
      { label: 'DermNet: Treatment of atopic dermatitis', href: 'https://dermnetnz.org/topics/treatment-of-atopic-dermatitis' },
    ],
  },
  'excessive-sweating': {
    overview: [
      'Hyperhidrosis is excessive sweating beyond what is needed for temperature regulation.',
      'It may be primary (often symmetrical, starts young, improves during sleep) or secondary to medication or medical conditions.',
      'Common affected areas include underarms, palms, soles, and face.',
    ],
    features: [
      'Sweating that interferes with work, social interaction, or daily tasks',
      'Recurrent dampness, odour, or clothing disruption',
      'Associated dermatitis or secondary infection in affected areas',
      'Possible night sweating if secondary causes are present',
    ],
    assessment: [
      'Pattern-based history to distinguish focal primary vs secondary disease',
      'Review of medications and systemic symptoms',
      'Targeted investigations when secondary hyperhidrosis is suspected',
    ],
    treatment: [
      'Topical antiperspirants and skin-care measures',
      'Iontophoresis for palms/soles when appropriate',
      'Botulinum toxin and specialist options for persistent focal disease',
    ],
    followup: [
      'Response is monitored by symptom burden and functional impact, not only sweat volume.',
      'Treatment is stepped according to effect duration and tolerance.',
    ],
    urgent: [
      'New generalised sweating with systemic symptoms',
      'Night sweats with unexplained weight loss or persistent fever',
      'Medication-associated sweating with concerning side effects',
    ],
    links: [
      { label: 'DermNet: Hyperhidrosis', href: 'https://dermnetnz.org/topics/hyperhidrosis' },
      { label: 'DermNet: Drug-induced hyperhidrosis', href: 'https://dermnetnz.org/topics/drug-induced-hyperhidrosis' },
    ],
  },
  'hair-loss': {
    overview: [
      'Hair loss (alopecia) can be patchy or diffuse, temporary or persistent, and may arise from scalp disorders or systemic factors.',
      'A key clinical distinction is non-scarring vs scarring alopecia, because scarring processes may cause permanent follicle loss.',
      'Common contributors include androgenetic change, telogen shedding, autoimmune patterns, inflammatory scalp disease, and nutritional/endocrine factors.',
    ],
    features: [
      'Increased shedding, thinning, or patchy bald areas',
      'Scalp symptoms such as itch, scale, tenderness, or burning',
      'Pattern clues (frontal/vertex thinning, diffuse shedding, focal patches)',
      'Possible related signs of endocrine, inflammatory, or nutritional disease',
    ],
    assessment: [
      'Detailed timeline of shedding/thinning and trigger events',
      'Scalp and hair-shaft examination (including inflammation/scarring signs)',
      'Targeted blood tests or referral where systemic causes are suspected',
    ],
    treatment: [
      'Cause-specific treatment plan rather than one-size-fits-all therapy',
      'Control of underlying scalp inflammation where present',
      'Medical therapies and monitoring according to alopecia subtype',
    ],
    followup: [
      'Hair disorders often need staged follow-up because visible regrowth lags behind treatment changes.',
      'Progress is tracked with symptom review, exam findings, and interval photographs when useful.',
    ],
    urgent: [
      'Rapidly progressive patchy loss with scalp redness or pain',
      'Signs suggesting scarring alopecia',
      'Hair loss with systemic red-flag symptoms',
    ],
    links: [
      { label: 'DermNet: Hair loss', href: 'https://dermnetnz.org/topics/hair-loss' },
      { label: 'DermNet: Alopecia areata', href: 'https://dermnetnz.org/topics/alopecia-areata' },
    ],
  },
  'infantile-acne': {
    overview: [
      'Infantile acne usually appears between 6 weeks and 1 year of age, most often on the cheeks and forehead.',
      'It can include comedones, papules, pustules, and occasionally deeper nodules, with a risk of scarring in more severe cases.',
      'Most cases are mild to moderate and improve over time with careful management.',
    ],
    features: [
      'Facial comedones and inflammatory spots in infants',
      'Potential for nodules/cysts in more active disease',
      'Higher prevalence in boys',
      'Consider endocrine review only when atypical features are present',
    ],
    assessment: [
      'Clinical examination to confirm acne pattern and severity',
      'Differentiation from neonatal cephalic pustulosis and other rashes',
      'Assessment for atypical signs suggesting hormonal disorder when indicated',
    ],
    treatment: [
      'Gentle skin care and age-appropriate topical treatment',
      'Escalation to specialist options for severe or scarring disease',
      'Regular review to monitor response and minimise scar risk',
    ],
    followup: [
      'Follow-up focuses on inflammation control, scar prevention, and parent guidance.',
      'Treatment intensity is adjusted cautiously with age and response.',
    ],
    urgent: [
      'Rapid progression with nodules/cysts and scarring risk',
      'Acne with abnormal growth or virilisation signs',
      'Poor response to appropriate first-line care',
    ],
    links: [
      { label: 'DermNet: Infantile acne', href: 'https://dermnetnz.org/topics/infantile-acne' },
      { label: 'DermNet: Acne in children', href: 'https://dermnetnz.org/topics/acne-in-children' },
    ],
  },
  'male-genital-skin-disorders': {
    overview: [
      'Male genital skin symptoms can arise from inflammatory, infectious, neuropathic, or premalignant conditions.',
      'Common presentations include itch, pain, soreness, erythema, irritation, and heightened skin sensitivity.',
      'Because causes overlap clinically, structured assessment is essential for accurate diagnosis and safe treatment.',
    ],
    features: [
      'Genital itch, discomfort, erythema, or tenderness',
      'Recurrent inflammation such as balanitis/balanoposthitis',
      'Symptoms triggered by irritants, friction, infection, or chronic inflammation',
      'Occasional dysaesthesia (burning, oversensitivity) without obvious rash',
    ],
    assessment: [
      'Focused history including hygiene, irritants, sexual and treatment history',
      'Clinical examination of skin pattern, lesion type, and distribution',
      'Swabs, targeted tests, or biopsy when diagnosis is unclear or persistent',
    ],
    treatment: [
      'Cause-directed treatment (eg, anti-inflammatory, antifungal, or infection management)',
      'Barrier-friendly skin care and trigger minimisation',
      'Specialist referral for persistent, recurrent, or atypical disease',
    ],
    followup: [
      'Follow-up ensures symptom control, recurrence prevention, and exclusion of serious pathology in unresolved cases.',
      'Patients receive practical maintenance advice for hygiene and trigger avoidance.',
    ],
    urgent: [
      'Rapid swelling or severe pain',
      'Ulcerating/non-healing lesions',
      'Urinary difficulty or progressive tight foreskin symptoms',
    ],
    links: [
      { label: 'DermNet: Genital skin problems', href: 'https://dermnetnz.org/topics/genital-skin-problems' },
      { label: 'DermNet: Balanitis', href: 'https://dermnetnz.org/topics/balanitis' },
      { label: 'DermNet: Male genital dysaesthesia', href: 'https://dermnetnz.org/topics/male-genital-dysaesthesia' },
    ],
  },
  psoriasis: {
    overview: [
      'Psoriasis is a chronic immune-mediated inflammatory skin disease that can affect skin, nails, and joints.',
      'It commonly presents with well-demarcated erythematous plaques and scale, but clinical pattern varies by subtype and skin tone.',
      'Beyond skin signs, psoriasis may be associated with psoriatic arthritis and broader cardiometabolic risk factors.',
    ],
    features: [
      'Persistent plaques with scale on typical extensor/scalp sites',
      'Intermittent flares influenced by stress, infection, and systemic factors',
      'Nail changes such as pitting, onycholysis, or subungual debris',
      'Potential joint pain/stiffness suggesting psoriatic arthritis',
    ],
    assessment: [
      'Clinical phenotyping of psoriasis subtype and distribution',
      'Severity and quality-of-life impact assessment',
      'Screening for nail/joint disease and associated comorbidity',
    ],
    treatment: [
      'Topical treatment for mild/localised disease',
      'Phototherapy for suitable moderate disease',
      'Systemic and biologic therapies for moderate-severe or refractory cases',
    ],
    followup: [
      'Management is long-term and tailored to disease burden, treatment response, and comorbidity profile.',
      'Follow-up includes flare prevention and therapy safety monitoring.',
    ],
    urgent: [
      'Rapidly generalising painful erythema or pustular flare',
      'Systemic unwellness with widespread skin involvement',
      'New disabling joint symptoms',
    ],
    links: [
      { label: 'DermNet: Psoriasis', href: 'https://dermnetnz.org/psoriasis' },
      { label: 'DermNet: Psoriatic arthritis', href: 'https://dermnetnz.org/topics/psoriatic-arthritis' },
    ],
  },
  'skin-cancer': {
    overview: [
      'Skin cancer includes basal cell carcinoma, squamous cell carcinoma, and melanoma, each with distinct behaviour and risk profiles.',
      'Early diagnosis improves treatment options and outcomes, especially for melanoma and higher-risk SCC.',
      'Evaluation focuses on lesion change over time, morphology, symptoms, and patient-specific risk factors.',
    ],
    features: [
      'New or changing lesion that does not resolve',
      'Non-healing ulcer, bleeding nodule, or persistent crusting area',
      'Pigmented lesions with asymmetry, irregular border, or colour variation',
      'Lesions in sun-exposed sites or high-risk scar/chronic inflammation sites',
    ],
    assessment: [
      'Clinical and dermatoscopic evaluation of suspicious lesions',
      'Urgency stratification based on malignancy risk',
      'Biopsy/excision and staging decisions when malignancy is suspected',
    ],
    treatment: [
      'Surgical removal is the core treatment for many skin cancers',
      'Adjunctive or specialist therapies based on subtype and stage',
      'Structured follow-up for recurrence and new-lesion surveillance',
    ],
    followup: [
      'Patients with previous skin cancer need long-term skin surveillance and UV protection counselling.',
      'Follow-up intervals depend on tumour type, stage, and individual risk profile.',
    ],
    urgent: [
      'Rapidly enlarging, bleeding, or ulcerating lesion',
      'Any lesion suspicious for melanoma change',
      'Persistent lesion with pain, numbness, or functional impact',
    ],
    links: [
      { label: 'DermNet: Skin cancer', href: 'https://dermnetnz.org/topics/skin-cancer' },
      { label: 'DermNet: Melanoma', href: 'https://dermnetnz.org/topics/melanoma' },
    ],
  },
  'skin-itching-and-its-causes': {
    overview: [
      'Pruritus (itch) is a symptom rather than a single diagnosis and can originate from dermatological, systemic, neuropathic, or medication-related causes.',
      'Persistent itch can significantly affect sleep, mood, and skin barrier integrity due to repeated scratching.',
      'Successful management depends on identifying and treating the underlying cause while controlling symptom burden.',
    ],
    features: [
      'Persistent itch with or without a primary visible rash',
      'Scratch-related skin changes such as excoriations or lichenification',
      'Potential sleep disturbance and reduced quality of life',
      'Pattern clues (localised vs generalised, trigger-linked vs spontaneous)',
    ],
    assessment: [
      'Detailed history including onset, distribution, triggers, medications, and associated symptoms',
      'Examination for primary skin disease versus secondary scratch changes',
      'Targeted blood tests or investigations when systemic causes are suspected',
    ],
    treatment: [
      'Treat underlying cause whenever identified',
      'Skin barrier repair and trigger reduction',
      'Anti-pruritic and condition-specific therapies according to diagnosis',
    ],
    followup: [
      'Chronic itch often needs stepwise treatment adjustment and regular reassessment.',
      'Follow-up also focuses on breaking itch-scratch cycles and restoring sleep quality.',
    ],
    urgent: [
      'Generalised severe itch with systemic symptoms',
      'Signs of infection or rapidly worsening skin breakdown',
      'Progressive symptoms despite initial treatment',
    ],
    links: [
      { label: 'DermNet: Pruritus', href: 'https://dermnetnz.org/topics/pruritus' },
      { label: 'DermNet: Drug-induced pruritus', href: 'https://dermnetnz.org/topics/drug-induced-pruritus' },
    ],
  },
  urticaria: {
    overview: [
      'Urticaria (hives) causes transient itchy weals, often with surrounding redness, and can occur with deeper swelling (angioedema).',
      'Individual weals commonly resolve within 24 hours, although new lesions may continue to appear.',
      'Urticaria may be acute or chronic, spontaneous or inducible.',
    ],
    features: [
      'Intensely itchy raised weals that migrate and fade',
      'Episodes with or without angioedema',
      'Acute pattern (<6 weeks) or chronic pattern (>6 weeks)',
      'Potential triggers including infection, pressure, temperature, or medications',
    ],
    assessment: [
      'Clinical pattern review and trigger history',
      'Distinguish urticaria from mimic conditions and vasculitic causes',
      'Focused testing only when history suggests secondary cause',
    ],
    treatment: [
      'Trigger minimisation where identifiable',
      'Non-sedating antihistamine strategy with dose adjustment when needed',
      'Escalation to specialist-directed therapy in refractory chronic disease',
    ],
    followup: [
      'Follow-up plans monitor frequency, severity, angioedema risk, and treatment response.',
      'Patients are given clear escalation advice for airway or severe swelling symptoms.',
    ],
    urgent: [
      'Lip, tongue, or throat swelling',
      'Breathing difficulty or collapse symptoms',
      'Rapid severe reaction suggestive of anaphylaxis',
    ],
    links: [
      { label: 'DermNet: Urticaria overview', href: 'https://dermnetnz.org/topics/urticaria-an-overview' },
      { label: 'DermNet: Chronic spontaneous urticaria', href: 'https://dermnetnz.org/topics/chronic-spontaneous-urticaria' },
    ],
  },
  vitiligo: {
    overview: [
      'Vitiligo is a chronic depigmenting condition in which melanocytes are progressively lost, causing white patches of skin.',
      'Generalised vitiligo is commonly associated with autoimmune disease, particularly thyroid dysfunction.',
      'Disease course is variable: some patients remain stable while others experience progression and new patches over time.',
    ],
    features: [
      'Sharply defined depigmented macules and patches',
      'Pattern may be localised, segmental, or generalised',
      'Higher psychosocial burden when visible sites are involved',
      'Possible association with other autoimmune conditions',
    ],
    assessment: [
      'Clinical diagnosis based on distribution and depigmentation pattern',
      'Wood lamp examination where useful for contrast',
      'Autoimmune screening (especially thyroid) when clinically indicated',
    ],
    treatment: [
      'Topical therapies for localised active disease',
      'Targeted or whole-body phototherapy in suitable patients',
      'Selected surgical options in stable, treatment-resistant disease',
    ],
    followup: [
      'Follow-up tracks progression, repigmentation response, and treatment tolerance.',
      'Management includes realistic counselling about time-to-response and long-term maintenance.',
    ],
    urgent: [
      'Rapidly progressive depigmentation with major psychosocial distress',
      'Treatment side effects requiring early review',
      'Associated autoimmune symptoms that need medical work-up',
    ],
    links: [
      { label: 'DermNet: Vitiligo', href: 'https://dermnetnz.org/topics/vitiligo' },
      { label: 'DermNet: Phototherapy in vitiligo (within vitiligo topic)', href: 'https://dermnetnz.org/topics/vitiligo' },
    ],
  },
};

const buildDermnetSections = (service) => {
  const profile = dermnetServiceProfiles[service.slug];
  if (!profile) return buildExtendedSections(service);

  return [
    {
      id: 'overview',
      title: 'Overview',
      paragraphs: [
        ...profile.overview,
        service.description,
      ],
    },
    {
      id: 'clinical-features',
      title: 'Clinical Features',
      paragraphs: [
        `Clinical presentation of ${service.title.toLowerCase()} can vary in severity and distribution, so assessment is individualised.`,
      ],
      bullets: profile.features,
    },
    {
      id: 'assessment-and-diagnosis',
      title: 'Assessment & Diagnosis',
      paragraphs: [
        'Assessment combines symptom timeline, trigger history, and focused clinical examination to establish diagnosis and urgency.',
      ],
      bullets: profile.assessment,
    },
    {
      id: 'treatment-pathways',
      title: 'Treatment Pathways',
      paragraphs: [
        'Treatment is tailored to severity, previous response, comorbidity, and patient preference.',
      ],
      bullets: profile.treatment,
    },
    {
      id: 'follow-up-and-monitoring',
      title: 'Follow-Up & Monitoring',
      paragraphs: profile.followup,
    },
    {
      id: 'when-to-seek-urgent-review',
      title: 'When To Seek Urgent Review',
      paragraphs: [
        'Seek urgent advice if symptoms escalate quickly or if new red-flag features appear.',
      ],
      bullets: profile.urgent,
    },
    {
      id: 'dermnet-sources',
      title: 'DermNet Sources Used',
      paragraphs: [
        'This page has been expanded using DermNet New Zealand clinical education content as the primary source base.',
      ],
      links: profile.links,
    },
  ];
};

const molesSections = [
  {
    id: 'overview',
    title: 'Overview',
    paragraphs: [
      'Most moles are benign (non-cancerous), but a new mole in adulthood or a changing existing mole should always be assessed.',
      'Melanoma can sometimes begin in a pre-existing mole, but it can also appear as a completely new mark. Early review improves the chance of simple treatment and better outcomes.',
      'Our mole service is designed to give you a clear, evidence-based assessment, practical follow-up advice, and a safe route into specialist care when needed.',
    ],
  },
  {
    id: 'what-are-moles',
    title: 'What Are Moles?',
    paragraphs: [
      'Moles (also called nevi) are common pigmented skin lesions. Many appear in childhood and adolescence, and can change slowly over time.',
      'Normal moles are often round or oval, with a clear edge and a more even colour pattern. Some become raised or may fade with age.',
      'Not all unusual marks are melanoma, but anything that looks different from your other moles, or keeps changing, should be checked clinically rather than watched indefinitely.',
    ],
  },
  {
    id: 'warning-signs',
    title: 'What To Look Out For',
    paragraphs: [
      'During assessment we combine clinical history, dermoscopy, and structured warning-sign tools such as ABCDE and the NICE weighted 7-point checklist.',
      'Concerning symptoms include persistent itching, tenderness, crusting, bleeding, inflammation, or visible evolution in shape and colour.',
    ],
    bullets: [
      'A — Asymmetry: one half looks unlike the other',
      'B — Border: irregular, notched, or poorly defined edges',
      'C — Colour: mixed or changing colours within the same lesion',
      'D — Diameter: often larger than 6mm, though melanoma can be smaller',
      'E — Evolving: any visible or symptomatic change over time',
      'Ugly duckling sign: a mole that looks noticeably different from your other moles',
    ],
    note: 'If you notice a new unusual lesion or a changing mole, book promptly rather than waiting for multiple changes.',
  },
  {
    id: 'risk-factors',
    title: 'Who Is At Higher Risk?',
    paragraphs: [
      'Anyone can develop melanoma, but risk is higher with cumulative UV exposure and certain personal or family factors.',
      'A risk-based approach helps us decide monitoring frequency, urgency of referral, and the safest treatment pathway.',
    ],
    bullets: [
      'History of significant sun exposure or recurrent sunburn',
      'Use of sunbeds',
      'Pale skin that burns easily',
      'Large numbers of moles or freckles',
      'Personal or family history of melanoma or skin cancer',
      'Previous atypical mole history',
    ],
  },
  {
    id: 'assessment',
    title: 'How We Assess Moles',
    paragraphs: [
      'Your consultation starts with a focused skin history: how long the lesion has been present, what changed, and whether symptoms such as bleeding, itch, or pain are present.',
      'We then examine the lesion and surrounding skin directly, and use dermoscopy when indicated. Dermoscopy is a magnified, illuminated skin examination that helps clinicians identify high-risk patterns more accurately.',
      'Where useful, serial photography can support short-interval monitoring to detect meaningful change over time.',
    ],
  },
  {
    id: 'referral-and-next-steps',
    title: 'Referral And Next Steps',
    paragraphs: [
      'If a lesion is clinically suspicious, we arrange urgent referral through the suspected cancer pathway in line with UK guidance.',
      'NICE guidance for suspected melanoma includes referral based on a suspicious pigmented lesion score (weighted 7-point checklist) or concerning dermoscopy findings.',
      'We explain exactly why referral is advised, what the timeline usually looks like, and what to do while waiting for specialist review.',
    ],
  },
  {
    id: 'treatment',
    title: 'Treatment Pathways',
    paragraphs: [
      'Management depends on risk profile, lesion appearance, and symptom history. Not every mole requires removal, and many are safely monitored with clear review criteria.',
      'Where diagnosis is uncertain or suspicion is higher, excision biopsy is typically used to remove the lesion for histology (laboratory analysis).',
      'Final treatment planning is guided by histology results and specialist recommendations.',
    ],
    bullets: [
      'Reassurance and self-monitoring for benign findings',
      'Planned review with repeat clinical/dermoscopic checks where appropriate',
      'Excision biopsy for suspicious lesions',
      'Specialist dermatology/plastic surgery referral when needed',
    ],
  },
  {
    id: 'aftercare-and-results',
    title: 'Aftercare, Results, And Follow-Up',
    paragraphs: [
      'After mole removal, we provide wound-care guidance, expected healing timelines, and safety-net advice for infection or delayed healing symptoms.',
      'If histology confirms a benign lesion, we discuss whether future routine monitoring is still useful based on your skin profile and history.',
      'If histology shows melanoma or another cancer, we coordinate onward care quickly and provide clear communication at each stage.',
    ],
  },
  {
    id: 'prevention',
    title: 'Prevention & Self-Checks',
    paragraphs: [
      'Sun protection and regular skin awareness are central to prevention. For many patients, the biggest risk reduction comes from consistent everyday habits rather than occasional intense changes.',
      'In the UK, practical guidance includes avoiding peak UV hours, protective clothing, and correct sunscreen use.',
    ],
    bullets: [
      'Use SPF 30+ sunscreen with at least 4-star UVA protection and reapply regularly',
      'Seek shade when UV is strongest (typically 11am to 3pm in the UK)',
      'Avoid sunbeds',
      'Check your skin monthly, including hard-to-see areas',
      'Ask a partner, friend, or family member to help check your back, scalp, and other difficult areas',
      'Remember to check palms, soles, and under/around nails as well',
    ],
  },
  {
    id: 'when-to-seek-urgent-help',
    title: 'When To Seek Urgent Review',
    paragraphs: [
      'Book urgent assessment if a lesion is rapidly changing, repeatedly bleeding, ulcerating, or becoming persistently painful.',
      'Also seek prompt review for a new dark streak under a nail, a lesion that does not heal, or any pigmented lesion that looks distinctly different from your usual mole pattern.',
      'If in doubt, err on the side of early review. Delayed assessment is a common reason concerning lesions are diagnosed later than necessary.',
    ],
  },
  {
    id: 'faqs',
    title: 'Common Questions',
    paragraphs: [
      'Do all moles need removal? No. Many are benign and can be monitored safely with a clear review plan.',
      'Can melanoma develop in normal skin? Yes. Melanoma can appear as a new lesion, not only from an existing mole.',
      'Can darker skin tones get melanoma? Yes. Risk may be lower overall, but melanoma can still occur and should be assessed promptly when suspicious changes appear.',
    ],
  },
  {
    id: 'sources',
    title: 'Research Sources Used',
    paragraphs: [
      'This draft content is based on DermNet New Zealand alongside UK clinical guidance resources.',
    ],
    links: [
      { label: 'DermNet: Melanocytic naevus (mole)', href: 'https://dermnetnz.org/topics/melanocytic-naevus' },
      { label: 'DermNet: Melanoma', href: 'https://dermnetnz.org/topics/melanoma' },
      { label: 'NHS: Moles', href: 'https://www.nhs.uk/conditions/moles/' },
      { label: 'NHS: Melanoma symptoms', href: 'https://www.nhs.uk/conditions/melanoma-skin-cancer/symptoms/' },
      { label: 'NHS: Melanoma causes and risk factors', href: 'https://www.nhs.uk/conditions/melanoma-skin-cancer/causes/' },
      { label: 'NICE NG12: Suspected cancer referral (skin cancers)', href: 'https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer#skin-cancers' },
      { label: 'Cancer Research UK: Dermoscopy', href: 'https://www.cancerresearchuk.org/about-cancer/tests-and-scans/looking-your-mole-dermoscopy' },
      { label: 'Cancer Research UK: Melanoma symptoms', href: 'https://www.cancerresearchuk.org/about-cancer/melanoma/symptoms' },
      { label: 'AAD: ABCDEs of melanoma', href: 'https://www.aad.org/public/diseases/skin-cancer/find/at-risk/abcdes' },
    ],
  },
];

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);
  const [activeSectionId, setActiveSectionId] = useState('');

  const sections = useMemo(
    () => (
      service
        ? (service.slug === 'moles'
          ? molesSections
          : service.category === 'Skin & Dermatology'
            ? buildDermnetSections(service)
            : buildExtendedSections(service))
        : []
    ),
    [service]
  );

  useEffect(() => {
    if (!sections.length) return;

    const sectionIds = sections.map((section) => section.id);

    const syncActiveSection = () => {
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= 170) current = id;
        else break;
      }
      setActiveSectionId((prev) => (prev === current ? prev : current));
    };

    syncActiveSection();
    window.addEventListener('scroll', syncActiveSection, { passive: true });
    window.addEventListener('resize', syncActiveSection);
    return () => {
      window.removeEventListener('scroll', syncActiveSection);
      window.removeEventListener('resize', syncActiveSection);
    };
  }, [sections]);

  useEffect(() => {
    if (!activeSectionId) return;
    const link = document.querySelector(
      `.service-template__toc-link[href="#${activeSectionId}"]`
    );
    if (!link) return;
    const toc = link.closest('.service-template__toc');
    if (!toc) return;
    if (!window.matchMedia('(max-width: 980px)').matches) return;
    const linkRect = link.getBoundingClientRect();
    const tocRect = toc.getBoundingClientRect();
    const offset = linkRect.left - tocRect.left - (tocRect.width - linkRect.width) / 2;
    toc.scrollTo({ left: toc.scrollLeft + offset, behavior: 'smooth' });
  }, [activeSectionId]);

  if (!service) {
    return (
      <>
        <section className="page-hero page-hero--navy">
          <div className="container page-hero__inner">
            <h1 className="page-hero__title">Service Not Found</h1>
            <p className="page-hero__subtitle">
              We could not find this service page. Please return to the services list.
            </p>
          </div>
        </section>

        <section className="service-template">
          <div className="container service-template__layout">
            <Link className="service-template__button" to="/services">Back to services</Link>
          </div>
        </section>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <section className="page-hero page-hero--navy">
        <div className="container page-hero__inner">
          <span className="service-template__eyebrow">{service.category}</span>
          <h1 className="page-hero__title">{service.title}</h1>
          <p className="page-hero__subtitle">{service.description}</p>
          <Link className="hero__cta" to="/contact">
            Book consultation
          </Link>
        </div>
      </section>

      <section className="service-template">
        <div className="container service-template__layout">
          <aside className="service-template__sidebar">
            <div className="service-template__sidebar-card">
              <span className="service-template__badge">{service.category}</span>
              <h2 className="service-template__sidebar-title">{service.title}</h2>
              <nav className="service-template__toc" aria-label="Service page sections">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    className={`service-template__toc-link ${activeSectionId === section.id ? 'is-active' : ''}`}
                    href={`#${section.id}`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="service-template__sidebar-cta">
                <Link className="service-template__button" to="/contact">
                  Book consultation
                </Link>
              </div>
            </div>
          </aside>

          <div className="service-template__content">
            {sections.map((section) => (
              <article key={section.id} id={section.id} className="service-template__card">
                <h3 className="service-template__heading">{section.title}</h3>
                {section.paragraphs?.map((paragraph, index) => (
                  <p key={`${section.id}-${index}`} className="service-template__text">{paragraph}</p>
                ))}
                {section.bullets?.length ? (
                  <ul className="service-template__list">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.note ? <p className="service-template__note">{section.note}</p> : null}
                {section.links?.length ? (
                  <ul className="service-template__links">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
