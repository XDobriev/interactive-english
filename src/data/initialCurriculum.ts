import type { Lesson } from '../types';

export const initialCurriculum: Lesson[] = [
  {
    id: 'unit-b1-travel',
    unitNumber: 5,
    title: 'Travel Dilemmas & Lost Baggage',
    level: 'B1',
    topic: 'Travel, Airports & Problem Solving',
    description: 'Learn vital airport vocabulary, practice dealing with delays and lost luggage, and master polite complaint structures.',
    vocabulary: [
      {
        id: 'v1',
        term: 'commence',
        transcription: '/kəˈmens/',
        translation: 'начинать, начинаться (официально)',
        partOfSpeech: 'verb',
        contextSentence: 'Boarding for flight LH-402 will commence shortly at Gate B14.',
      },
      {
        id: 'v2',
        term: 'misplace',
        transcription: '/ˌmɪsˈpleɪs/',
        translation: 'положить не туда, потерять',
        partOfSpeech: 'verb',
        contextSentence: 'The airline unfortunately misplaced my connecting luggage.',
      },
      {
        id: 'v3',
        term: 'baggage reclaim',
        transcription: '/ˈbæɡ.ɪdʒ rɪˌkleɪm/',
        translation: 'зона выдачи багажа',
        partOfSpeech: 'noun',
        contextSentence: 'Please proceed to carousel 4 in the baggage reclaim area.',
      },
      {
        id: 'v4',
        term: 'compensation',
        transcription: '/ˌkɒm.penˈseɪ.ʃən/',
        translation: 'компенсация, возмещение',
        partOfSpeech: 'noun',
        contextSentence: 'You are entitled to financial compensation for flights delayed over 3 hours.',
      },
      {
        id: 'v5',
        term: 'carry-on',
        transcription: '/ˈkær.i.ɒn/',
        translation: 'ручная кладь',
        partOfSpeech: 'noun',
        contextSentence: 'Make sure your carry-on luggage complies with cabin weight limits.',
      },
    ],
    sections: [
      {
        id: 'sec-warmup',
        sectionNumber: 1,
        title: 'Warm-up & Discussion',
        subtitle: 'Personal travel experiences & icebreaker',
        exercises: [
          {
            id: 'ex-warmup-1',
            type: 'media_rule',
            title: 'Discussion: Airport Experiences',
            instruction: 'Discuss these questions with your teacher to activate your vocabulary:',
            scoreWeight: 3,
            teacherNote: 'Encourage student to speak in full sentences. Ask: "Have you ever experienced flight delays or lost luggage? How did you solve it?"',
            data: {
              ruleTitle: 'Icebreaker Questions',
              markdownContent: '1. How often do you travel by plane?\n2. What is the most stressful part of air travel for you?\n3. If your luggage went missing in a foreign country, what would be your very first step?',
              discussionPrompts: [
                'Do you prefer packing light (carry-on only) or checking in a big suitcase?',
                'Share one memorable journey where something unexpected happened.'
              ]
            }
          }
        ]
      },
      {
        id: 'sec-vocab',
        sectionNumber: 2,
        title: 'Vocabulary & Context',
        subtitle: 'Key terms for dealing with airport staff',
        exercises: [
          {
            id: 'ex-vocab-blanks',
            type: 'fill_blanks',
            title: 'Fill in the Blanks: Passenger Complaint',
            instruction: 'Complete the sentences using the most appropriate words in brackets:',
            scoreWeight: 4,
            teacherNote: 'Clarify the difference between "commence" (formal register) and "start". If student struggles with "reclaim", explain: re + claim = claim again.',
            data: {
              items: [
                {
                  id: 'b1',
                  prefixText: 'When we finally reached the departure gate, boarding had already ',
                  correctAnswer: 'commenced',
                  hint: 'commence / delay',
                  suffixText: ' for priority passengers.'
                },
                {
                  id: 'b2',
                  prefixText: 'The ground crew accidentally ',
                  correctAnswer: 'misplaced',
                  hint: 'misplace / refund',
                  suffixText: ' my suitcase during the layover in Munich.'
                },
                {
                  id: 'b3',
                  prefixText: 'I spent an hour at the ',
                  correctAnswer: 'baggage reclaim',
                  hint: 'baggage reclaim / duty-free',
                  suffixText: ' counter filling out a missing property report.'
                },
                {
                  id: 'b4',
                  prefixText: 'Passengers are entitled to monetary ',
                  correctAnswer: 'compensation',
                  hint: 'compensation / reservation',
                  suffixText: ' if the flight cancellation was within the airline\'s control.'
                }
              ]
            }
          },
          {
            id: 'ex-vocab-match',
            type: 'match_pairs',
            title: 'Match Pairs: Airport Collocations',
            instruction: 'Match each English term with its accurate definition or translation:',
            scoreWeight: 4,
            teacherNote: 'Have the student read each pair aloud after matching to practice pronunciation and word stress.',
            data: {
              pairs: [
                { id: 'p1', leftText: 'Boarding pass', rightText: 'Посадочный талон' },
                { id: 'p2', leftText: 'Overhead bin', rightText: 'Полка для ручной клади над креслом' },
                { id: 'p3', leftText: 'Connecting flight', rightText: 'Рейс с пересадкой' },
                { id: 'p4', leftText: 'Baggage carousel', rightText: 'Лента выдачи багажа' }
              ]
            }
          }
        ]
      },
      {
        id: 'sec-grammar',
        sectionNumber: 3,
        title: 'Grammar & Sentence Building',
        subtitle: 'Past Continuous vs Past Simple & Polite Requests',
        exercises: [
          {
            id: 'ex-word-order-1',
            type: 'word_order',
            title: 'Word Order: Polite Complaint at the Desk',
            instruction: 'Click the words in the exact sequence to build a polite, natural request:',
            scoreWeight: 4,
            teacherNote: 'Remind student of the polite structure: "Could you please + infinitive...?". Contrast with direct/rude: "Give me my bag!".',
            data: {
              items: [
                {
                  id: 'wo1',
                  targetSentence: 'Could you please check where my suitcase is?',
                  shuffledWords: ['Could', 'you', 'please', 'check', 'where', 'my', 'suitcase', 'is?'],
                  hint: 'Start with polite modal verb'
                },
                {
                  id: 'wo2',
                  targetSentence: 'While I was waiting for my flight the gate changed.',
                  shuffledWords: ['While', 'I', 'was', 'waiting', 'for', 'my', 'flight', 'the', 'gate', 'changed.'],
                  hint: 'Notice the long background action (Past Continuous)'
                }
              ]
            }
          },
          {
            id: 'ex-quiz-grammar',
            type: 'quiz',
            title: 'Grammar Quiz: Past Actions in Context',
            instruction: 'Choose the correct tense or structure for each scenario:',
            scoreWeight: 3,
            teacherNote: 'Test understanding of interrupted past actions: Past Continuous for long background action, Past Simple for the interrupting event.',
            data: {
              questions: [
                {
                  id: 'q1',
                  question: 'The plane ________ (fly) over the Alps when severe turbulence suddenly began.',
                  options: ['was flying', 'flew', 'has flown', 'is flying'],
                  correctOptionIndex: 0,
                  explanation: 'Past Continuous ("was flying") expresses a continuous background action interrupted by a sudden event.'
                },
                {
                  id: 'q2',
                  question: 'If my luggage doesn\'t arrive by tomorrow, I ________ to buy fresh clothes.',
                  options: ['will need', 'would needed', 'need to', 'needed'],
                  correctOptionIndex: 0,
                  explanation: 'First Conditional: "If + Present Simple, will + base verb" for real future consequences.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'sec-flashcards',
        sectionNumber: 4,
        title: 'Flashcards & Memory Drill',
        subtitle: 'Reinforce active terminology',
        exercises: [
          {
            id: 'ex-flashcards-travel',
            type: 'flashcards',
            title: 'Vocabulary Drill: Flip & Pronounce',
            instruction: 'Flip through the cards, listen to the pronunciation, and test your memory:',
            scoreWeight: 5,
            teacherNote: 'Ask student to invent their own short sentence with each card before flipping.',
            data: {
              cards: [
                {
                  id: 'fc1',
                  term: 'Layover',
                  transcription: '/ˈleɪˌoʊ.vər/',
                  translation: 'Пересадка (ожидание между рейсами)',
                  definitionEn: 'A short stay between parts of a journey, especially between flights.',
                  exampleSentence: 'We had a 4-hour layover in Istanbul before flying to Tokyo.'
                },
                {
                  id: 'fc2',
                  term: 'Jet lag',
                  transcription: '/ˈdʒet ˌlæɡ/',
                  translation: 'Синдром смены часовых поясов',
                  definitionEn: 'Extreme tiredness felt after a long journey across multiple time zones.',
                  exampleSentence: 'Drink plenty of water on long flights to minimize jet lag.'
                },
                {
                  id: 'fc3',
                  term: 'Customs declaration',
                  transcription: '/ˈkʌs.təmz ˌdek.ləˈreɪ.ʃən/',
                  translation: 'Таможенная декларация',
                  definitionEn: 'An official document listing goods being brought into a country.',
                  exampleSentence: 'You must fill out a customs declaration before landing.'
                }
              ]
            }
          }
        ]
      }
    ],
    createdAt: '2026-10-23T00:00:00Z',
    updatedAt: '2026-10-23T00:00:00Z'
  },

  {
    id: 'unit-a2-cafe',
    unitNumber: 2,
    title: 'Ordering at a Cozy Café',
    level: 'A2',
    topic: 'Food, Drinks, Countable/Uncountable & Politeness',
    description: 'Master everyday café interactions, polite requests with "Would like", and count/uncount food items.',
    vocabulary: [
      {
        id: 'v11',
        term: 'sparkling water',
        transcription: '/ˌspɑː.klɪŋ ˈwɔː.tər/',
        translation: 'газированная вода',
        partOfSpeech: 'noun',
        contextSentence: 'Could I have a bottle of sparkling water with lemon, please?',
      },
      {
        id: 'v12',
        term: 'pastry',
        transcription: '/ˈpeɪ.stri/',
        translation: 'выпечка, пирожное',
        partOfSpeech: 'noun',
        contextSentence: 'All of our pastries are baked fresh every morning.',
      },
      {
        id: 'v13',
        term: 'receipt',
        transcription: '/rɪˈsiːt/',
        translation: 'чек (бумажный)',
        partOfSpeech: 'noun',
        contextSentence: 'Would you like your receipt in the bag or with you?',
      }
    ],
    sections: [
      {
        id: 'sec-a2-warmup',
        sectionNumber: 1,
        title: 'Warm-up: Your Coffee Routine',
        subtitle: 'Talking about daily preferences',
        exercises: [
          {
            id: 'ex-a2-1',
            type: 'media_rule',
            title: 'Discussion: Coffee or Tea?',
            instruction: 'Answer these warm-up questions with your teacher:',
            scoreWeight: 2,
            teacherNote: 'Encourage student to use: "I prefer...", "Usually I drink...". Check pronunciation of "receipt" (the "p" is silent!).',
            data: {
              ruleTitle: 'Café Habits',
              markdownContent: '1. Do you drink coffee or tea in the morning?\n2. What is your favorite dessert when you visit a café?\n3. Do you prefer eating in or taking your drink to go?',
              discussionPrompts: ['Describe the best bakery in your hometown.']
            }
          }
        ]
      },
      {
        id: 'sec-a2-dialog',
        sectionNumber: 2,
        title: 'Ordering Practice',
        subtitle: 'Polite formulas with "I\'d like"',
        exercises: [
          {
            id: 'ex-a2-blanks',
            type: 'fill_blanks',
            title: 'Complete the Café Order',
            instruction: 'Fill in the polite expressions in the dialogue:',
            scoreWeight: 3,
            teacherNote: 'Contrast "I want" (sounds too blunt/rude in English) with "I would like / Could I have".',
            data: {
              items: [
                {
                  id: 'a2b1',
                  prefixText: 'Hello! I ',
                  correctAnswer: 'would like',
                  hint: 'would like / want',
                  suffixText: ' a cappuccino with oat milk, please.'
                },
                {
                  id: 'a2b2',
                  prefixText: 'Sure! For here or ',
                  correctAnswer: 'to go',
                  hint: 'to go / to leave',
                  suffixText: '?'
                },
                {
                  id: 'a2b3',
                  prefixText: 'Can I pay by ',
                  correctAnswer: 'card',
                  hint: 'card / receipt',
                  suffixText: '?'
                }
              ]
            }
          }
        ]
      }
    ],
    createdAt: '2026-10-23T00:00:00Z',
    updatedAt: '2026-10-23T00:00:00Z'
  },

  {
    id: 'unit-b2-negotiation',
    unitNumber: 8,
    title: 'Job Interview & Business Collocations',
    level: 'B2',
    topic: 'Career, Professional Strengths & Business Idioms',
    description: 'High-impact vocabulary and idioms for professional English: pitching yourself, handling difficult questions, and corporate collocations.',
    vocabulary: [
      {
        id: 'v21',
        term: 'track record',
        transcription: '/ˈtræk ˌrek.ɔːd/',
        translation: 'послужной список, опыт успешных результатов',
        partOfSpeech: 'noun',
        contextSentence: 'I have a proven track record of increasing customer retention.',
      },
      {
        id: 'v22',
        term: 'think outside the box',
        transcription: '/θɪŋk ˌaʊtˈsaɪd ðə bɒks/',
        translation: 'мыслить нестандартно',
        partOfSpeech: 'idiom',
        contextSentence: 'Our marketing team always encourages members to think outside the box.',
      }
    ],
    sections: [
      {
        id: 'sec-b2-intro',
        sectionNumber: 1,
        title: 'Professional Presentation',
        subtitle: 'Strengths and career achievements',
        exercises: [
          {
            id: 'ex-b2-match',
            type: 'match_pairs',
            title: 'Business Collocations Matching',
            instruction: 'Match verbs with corporate nouns to form natural business collocations:',
            scoreWeight: 4,
            teacherNote: 'Discuss why native speakers say "meet deadlines" rather than "finish on time" in resumes.',
            data: {
              pairs: [
                { id: 'bp1', leftText: 'Meet', rightText: 'Strict deadlines' },
                { id: 'bp2', leftText: 'Spearhead', rightText: 'A strategic project' },
                { id: 'bp3', leftText: 'Streamline', rightText: 'Internal workflow processes' },
                { id: 'bp4', leftText: 'Deliver', rightText: 'Measurable ROI results' }
              ]
            }
          }
        ]
      }
    ],
    createdAt: '2026-10-23T00:00:00Z',
    updatedAt: '2026-10-23T00:00:00Z'
  },
  {
    id: 'unit-a1-routine',
    unitNumber: 1,
    title: 'First Meetings & Daily Routine',
    level: 'A1',
    topic: 'Introductions, Daily Habits & Present Simple',
    description: 'Master essential greetings, talking about daily schedule, and forming questions with Do and Does.',
    vocabulary: [
      {
        id: 'va1-1',
        term: 'wake up',
        transcription: '/weɪk ʌp/',
        translation: 'просыпаться',
        partOfSpeech: 'verb',
        contextSentence: 'I usually wake up at 7:30 in the morning.',
      },
      {
        id: 'va1-2',
        term: 'have breakfast',
        transcription: '/hæv ˈbrek.fəst/',
        translation: 'завтракать',
        partOfSpeech: 'phrase',
        contextSentence: 'Do you have breakfast before going to work?',
      },
      {
        id: 'va1-3',
        term: 'seldom',
        transcription: '/ˈsel.dəm/',
        translation: 'редко',
        partOfSpeech: 'adverb',
        contextSentence: 'She seldom drinks coffee in the evening.',
      },
    ],
    sections: [
      {
        id: 'sec-a1-1',
        sectionNumber: 1,
        title: 'Daily Schedule & Habits',
        subtitle: 'Talking about everyday routines with Present Simple',
        exercises: [
          {
            id: 'ex-a1-fill',
            type: 'fill_blanks',
            title: 'Present Simple Sentences',
            instruction: 'Fill in the blanks with the correct form of the verb in brackets:',
            scoreWeight: 3,
            teacherNote: 'Check the 3rd person singular -s ending (he/she/it). Ask the student about their own routine.',
            data: {
              items: [
                {
                  id: 'a1-b1',
                  prefixText: 'He usually ',
                  correctAnswer: 'wakes',
                  hint: 'wake',
                  suffixText: ' up early on weekdays.'
                },
                {
                  id: 'a1-b2',
                  prefixText: 'What time ',
                  correctAnswer: 'do',
                  hint: 'do / does',
                  suffixText: ' you start your working day?'
                },
                {
                  id: 'a1-b3',
                  prefixText: 'She ',
                  correctAnswer: 'doesn\'t',
                  hint: 'not do',
                  suffixText: ' drink tea with sugar.'
                }
              ]
            }
          },
          {
            id: 'ex-a1-order',
            type: 'word_order',
            title: 'Forming Questions',
            instruction: 'Rearrange the words to build a grammatically correct question:',
            scoreWeight: 3,
            teacherNote: 'Highlight question structure: Question word + Do/Does + Subject + Verb.',
            data: {
              items: [
                {
                  id: 'wo-a1-1',
                  targetSentence: 'Where do you live in London?',
                  shuffledWords: ['live', 'Where', 'London?', 'in', 'do', 'you'],
                  hint: 'Begin with "Where"'
                }
              ]
            }
          }
        ]
      }
    ],
    createdAt: '2026-10-23T00:00:00Z',
    updatedAt: '2026-10-23T00:00:00Z'
  },
  {
    id: 'unit-c1-nuance',
    unitNumber: 12,
    title: 'Persuasion, Rhetoric & Inversion',
    level: 'C1',
    topic: 'Advanced Inversion, Sophisticated Collocations & Debates',
    description: 'Elevate your English with formal inversion (Rarely have I seen...), rhetorical framing, and subtle idiomatic nuance.',
    vocabulary: [
      {
        id: 'vc1-1',
        term: 'seldom if ever',
        transcription: '/ˈsel.dəm ɪf ˈev.ər/',
        translation: 'крайне редко, если вообще когда-либо',
        partOfSpeech: 'phrase',
        contextSentence: 'Seldom if ever do we witness such a profound market shift.',
      },
      {
        id: 'vc1-2',
        term: 'paradigm shift',
        transcription: '/ˈpær.ə.daɪm ʃɪft/',
        translation: 'коренной перелом, смена парадигмы',
        partOfSpeech: 'noun',
        contextSentence: 'AI represents a genuine paradigm shift in language pedagogy.',
      },
    ],
    sections: [
      {
        id: 'sec-c1-1',
        sectionNumber: 1,
        title: 'Mastering Negative Inversion',
        subtitle: 'Formal rhetorical structures for emphasis',
        exercises: [
          {
            id: 'ex-c1-rule',
            type: 'media_rule',
            title: 'Grammar Focus: Negative Inversion',
            instruction: 'Listen to the audio explanation and examine how inversion emphasizes certainty and gravity:',
            scoreWeight: 2,
            teacherNote: 'Encourage the student to use these in essay writing or executive presentations.',
            data: {
              ruleTitle: 'Negative Inversion Formula',
              markdownContent: 'When negative or restrictive adverbs (Rarely, Seldom, Little, Under no circumstances, Not only) are placed at the beginning of a clause for emphasis, the subject and auxiliary verb invert:\n\n• Normal: I have rarely encountered such dedication.\n• Inverted: Rarely have I encountered such dedication.\n• Normal: She didn\'t know what awaited her.\n• Inverted: Little did she know what awaited her.',
              discussionPrompts: [
                'In what contexts does inversion sound natural versus overly dramatic?',
                'Try rewriting: "We can under no circumstances accept this offer" into inverted form.'
              ]
            }
          },
          {
            id: 'ex-c1-blanks',
            type: 'fill_blanks',
            title: 'Inverted Clauses Practice',
            instruction: 'Complete the inverted sentences with auxiliary verbs:',
            scoreWeight: 3,
            teacherNote: 'Watch out for tense agreement (have vs did).',
            data: {
              items: [
                {
                  id: 'c1-b1',
                  prefixText: 'Not only ',
                  correctAnswer: 'did',
                  hint: 'auxiliary verb (past)',
                  suffixText: ' he arrive late, but he also forgot the key documents.'
                },
                {
                  id: 'c1-b2',
                  prefixText: 'Hardly ',
                  correctAnswer: 'had',
                  hint: 'auxiliary verb (past perfect)',
                  suffixText: ' the plane landed when passengers began unbuckling their seatbelts.'
                }
              ]
            }
          }
        ]
      }
    ],
    createdAt: '2026-10-23T00:00:00Z',
    updatedAt: '2026-10-23T00:00:00Z'
  }
];

