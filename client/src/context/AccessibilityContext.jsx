import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api.js';
import { playSpeech } from '../services/audioPlayer.js';

const AccessibilityContext = createContext(null);

export const ACCESSIBLE_GREETINGS = {
  English:
    'Welcome to AccessBridge Accessibility Assistant. Spoken voice assistance and auto-read aloud are now active. Press Tab to browse tools or click the microphone to talk.',
  Tamil:
    'AccessBridge அணுகல் உதவி தளத்திற்கு வரவேற்கிறோம். குரல் உதவி மற்றும் தானியங்கி வாசிப்பு வசதி இயக்கப்பட்டுள்ளது. வழிசெலுத்த Tab அழுத்தவும் அல்லது பேச மைக்ரோஃபோனை அழுத்தவும்.',
  Hindi:
    'AccessBridge एक्सेसिबिलिटी असिस्टेंट में आपका स्वागत है। वॉयस असिस्टेंट और ऑटो-रीड सक्रिय हैं। टूल्स पर जाने के लिए Tab दबाएं या बोलने के लिए माइक पर क्लिक करें।',
  Telugu:
    'AccessBridge యాక్సెసిబిలిటీ అసిస్టెంట్‌కి స్వాగతం. వాయిస్ అసిస్టెంట్ మరియు ఆటో-రీడ్ ఆన్ చేయబడ్డాయి. నావిగేట్ చేయడానికి Tab నొక్కండి లేదా మాట్లాడటానికి మైక్రోఫోన్‌ను క్లిక్ చేయండి.',
  Malayalam:
    'AccessBridge ആക്സസിബിലിറ്റി അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. വോയ്സ് അസിസ്റ്റന്റും ഓട്ടോ-റീഡും പ്രവർത്തനക്ഷമമാണ്. നാവിഗേറ്റ് ചെയ്യാൻ Tab അമർത്തുക അല്ലെങ്കിൽ സംസാരിക്കാൻ മൈക്രോഫോൺ ക്ലിക്ക് ചെയ്യുക.',
  Kannada:
    'AccessBridge ಪ್ರವೇಶಿಸುವಿಕೆ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ. ಧ್ವನಿ ಸಹಾಯಕ ಮತ್ತು ಸ್ವಯಂ-ಓದುವಿಕೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ. ಪರಿಕರಗಳಿಗಾಗಿ Tab ಒತ್ತಿರಿ ಅಥವಾ ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.',
};

export const PAGE_AUDIO_INTRODUCTIONS = {
  English: {
    '/': 'Home page. AccessBridge converts complex documents, medical notices, and images into plain language and speech.',
    '/dashboard': 'Dashboard. Choose Content Simplifier, Image Describer, Voice Assistant, or Lecture Notes.',
    '/simplify': 'Content Simplifier. Paste text, enter URL, or upload PDF to generate plain language, 3 key points, and translations.',
    '/describe-image': 'Image Describer. Upload any diagram or photo to hear detailed scene descriptions, screen-reader alt text, and visible OCR text.',
    '/voice-assistant': 'Voice Assistant. Speak your questions hands-free or choose your language to talk with the assistant.',
    '/lecture-notes': 'Lecture Notes. Convert recorded transcripts into structured summaries and a 3-question learning quiz.',
    '/history': 'Saved History. Review and listen to your past simplifications and image descriptions.',
    '/profile': 'Accessibility Profile. Configure reading level, language, text scaling, and sensory settings.',
  },
  Tamil: {
    '/': 'முகப்புப் பக்கம். AccessBridge சிக்கலான ஆவணங்கள் மற்றும் படங்களை எளிய மொழி மற்றும் குரலாக மாற்றுகிறது.',
    '/dashboard': 'டாஷ்போர்டு. உள்ளடக்க எளிதாக்கி, பட விவரிப்பான், குரல் உதவியாளர் அல்லது விரிவுரை குறிப்புகளைத் தேர்ந்தெடுக்கவும்.',
    '/simplify': 'உள்ளடக்க எளிதாக்கி. எளிய விளக்கம், முக்கிய குறிப்புகள் மற்றும் மொழிபெயர்ப்பு பெற உரையை உள்ளிடவும் அல்லது கோப்பைப் பதிவேற்றவும்.',
    '/describe-image': 'பட விவரிப்பான். படங்களின் விரிவான விளக்கம் மற்றும் உரையை அறிய படத்தைப் பதிவேற்றவும்.',
    '/voice-assistant': 'குரல் உதவியாளர். உங்கள் கேள்விகளைத் தமிழில் பேசி உடனடியாக குரல் வழியே பதில்களைப் பெறலாம்.',
    '/lecture-notes': 'விரிவுரை குறிப்புகள். ஆடியோ உரைவடிவத்தை உள்ளிட்டு எளிய சுருக்கம் மற்றும் கற்றல் வினாடி வினாவைப் பெறலாம்.',
    '/history': 'சேமிக்கப்பட்ட வரலாறு. உங்கள் கடந்த கால முடிவுகளைக் கேட்கவும் மதிப்பாய்வு செய்யவும்.',
    '/profile': 'அணுகல்தன்மை சுயவிவரம். மொழி, எழுத்து அளவு மற்றும் பார்வை அமைப்புகளைத் தனிப்பயனாக்குங்கள்.',
  },
  Hindi: {
    '/': 'मुख्य पृष्ठ। एक्सेसब्रिज जटिल दस्तावेज़ों और छवियों को सरल भाषा और ऑडियो में बदलता है।',
    '/dashboard': 'डैशबोर्ड। कंटेंट सिंपलीफायर, इमेज डिस्क्राइबर, वॉयस असिस्टेंट या लेक्चर नोट्स चुनें।',
    '/simplify': 'कंटेंट सिंपलीफायर। सरल भाषा, मुख्य बिंदु और अनुवाद प्राप्त करने के लिए टेक्स्ट दर्ज करें या पीडीएफ अपलोड करें।',
    '/describe-image': 'इमेज डिस्क्राइबर। विस्तृत दृश्य विवरण और ओसीआर टेक्स्ट सुनने के लिए कोई भी छवि अपलोड करें।',
    '/voice-assistant': 'वॉयस असिस्टेंट। हैंड्स-फ्री सवाल बोलें और अपनी भाषा में उत्तर सुनें।',
    '/lecture-notes': 'लेक्चर नोट्स। रिकॉर्ड किए गए प्रतिलेख को संक्षिप्त सारांश और 3-प्रश्नों की क्विज में बदलें।',
    '/history': 'सहेजा गया इतिहास। अपने पिछले परिणामों को सुनें और समीक्षा करें।',
    '/profile': 'अभिगम्यता प्रोफ़ाइल। भाषा, फ़ॉन्ट आकार और प्राथमिकताओं को अनुकूलित करें।',
  },
  Telugu: {
    '/': 'హోమ్ పేజీ. యాక్సెస్ బ్రిడ్జ్ సంక్లిష్టమైన పత్రాలు మరియు చిత్రాలను సరళమైన భాష మరియు ఆడియోగా మారుస్తుంది.',
    '/dashboard': 'డ్యాష్‌బోర్డ్. కంటెంట్ సింప్లిఫైయర్, ఇమేజ్ డిస్క్రైబర్, వాయిస్ అసిస్టెంట్ లేదా లెక్చర్ నోట్స్ ఎంచుకోండి.',
    '/simplify': 'కంటెంట్ సింప్లిఫైయర్. సరళమైన భాష, ముఖ్య అంశాలు మరియు అనువాదాల కోసం వచనాన్ని నమోదు చేయండి.',
    '/describe-image': 'ఇమేజ్ డిస్క్రైబర్. వివరణాత్మక దృశ్య సమాచారం మరియు OCR వచనాన్ని వినడానికి చిత్రాన్ని అప్‌లోడ్ చేయండి.',
    '/voice-assistant': 'వాయిస్ అసిస్టెంట్. మీ ప్రశ్నలను మాట్లాడండి మరియు సహాయకునితో మీ భాషలో మాట్లాడండి.',
    '/lecture-notes': 'లెక్చర్ నోట్స్. ట్రాన్స్‌క్రిప్ట్‌లను నిర్మాణాత్మక సారాంశాలు మరియు 3-ప్రశ్నల క్విజ్‌గా మార్చండి.',
    '/history': 'భద్రపరిచిన చరిత్ర. మీ గత ఫలితాలను వినండి మరియు సమీక్షించండి.',
    '/profile': 'యాక్సెసిబిలిటీ ప్రొఫైల్. పఠన స్థాయి, భాష, ఫాంట్ పరిమాణాన్ని సెట్ చేసుకోండి.',
  },
  Malayalam: {
    '/': 'ഹോം പേജ്. ആക്‌സസ് ബ്രിഡ്ജ് സങ്കീർണ്ണമായ രേഖകളും ചിത്രങ്ങളും ലളിതമായ ഭാഷയിലേക്കും ഓഡിയോയിലേക്കും മാറ്റുന്നു.',
    '/dashboard': 'ഡാഷ്‌ബോർഡ്. കണ്ടന്റ് സിംപ്ലിഫയർ, ഇമേജ് ഡിസ്ക്രൈബർ, വോയ്‌സ് അസിസ്റ്റന്റ് അല്ലെങ്കിൽ ലക്ചർ നോട്സ് തിരഞ്ഞെടുക്കുക.',
    '/simplify': 'കണ്ടന്റ് സിംപ്ലിഫയർ. ലളിതമായ ഭാഷയും വിവർത്തനവും ലഭിക്കാൻ ടെക്സ്റ്റ് നൽകുക അല്ലെങ്കിൽ ഫയൽ അപ്‌ലോഡ് ചെയ്യുക.',
    '/describe-image': 'ഇമേജ് ഡിസ്ക്രൈബർ. വിശദമായ വിവരണവും ചിത്രത്തിലെ ടെക്സ്റ്റും അറിയാൻ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.',
    '/voice-assistant': 'വോയ്‌സ് അസിസ്റ്റന്റ്. സംശയങ്ങൾ ചോദിക്കാനും ഓഡിയോയിൽ ഉത്തരം കേൾക്കാനും മൈക്ക് ഉപയോഗിക്കുക.',
    '/lecture-notes': 'ലക്ചർ നോട്സ്. റെക്കോർഡിംഗ് വിവരങ്ങൾ ലളിതമായ സംഗ്രഹവും ക്വിസുമാക്കി മാറ്റുക.',
    '/history': 'സേവ് ചെയ്ത ചരിത്രം. മുൻ ഫലങ്ങൾ കേൾക്കുകയും പരിശോധിക്കുകയും ചെയ്യുക.',
    '/profile': 'ആക്സസിബിലിറ്റി പ്രൊഫൈൽ. ഭാഷയും ഫോണ്ട് വലുപ്പവും ആവശ്യാനുസരണം മാറ്റുക.',
  },
  Kannada: {
    '/': 'ಮುಖಪುಟ. ಆಕ್ಸೆಸ್ ಬ್ರಿಡ್ಜ್ ಸಂಕೀರ್ಣ ದಾಖಲೆಗಳು ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ಸರಳ ಭಾಷೆ ಮತ್ತು ಧ್ವನಿಗೆ ಪರಿವರ್ತಿಸುತ್ತದೆ.',
    '/dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್. ವಿಷಯ ಸರಳೀಕಾರಕ, ಚಿತ್ರ ವಿವರಣೆ, ಧ್ವನಿ ಸಹಾಯಕ ಅಥವಾ ಉಪನ್ಯಾಸ ಟಿಪ್ಪಣಿಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    '/simplify': 'ವಿಷಯ ಸರಳೀಕಾರಕ. ಸರಳ ವಿವರಣೆ ಮತ್ತು ಅನುವಾದ ಪಡೆಯಲು ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    '/describe-image': 'ಚಿತ್ರ ವಿವರಣೆ. ಚಿತ್ರದ ವಿವರ ಮತ್ತು ಪಠ್ಯವನ್ನು ಕೇಳಲು ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    '/voice-assistant': 'ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಮಾತನಾಡಿ ಮತ್ತು ಉತ್ತರವನ್ನು ಆಲಿಸಿ.',
    '/lecture-notes': 'ಉಪನ್ಯಾಸ ಟಿಪ್ಪಣಿಗಳು. ಪ್ರತಿಲಿಪಿಯನ್ನು ಸರಳ ಸಾರಾಂಶ ಮತ್ತು ರಸಪ್ರಶ್ನೆಯಾಗಿ ಪರಿವರ್ತಿಸಿ.',
    '/history': 'ಉಳಿಸಿದ ಇತಿಹಾಸ. ನಿಮ್ಮ ಹಿಂದಿನ ಫಲಿತಾಂಶಗಳನ್ನು ಆಲಿಸಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ.',
    '/profile': 'ಪ್ರವೇಶಿಸುವಿಕೆ ಪ್ರೊಫೈಲ್. ಓದುವ ಮಟ್ಟ, ಭಾಷೆ ಮತ್ತು ಫಾಂಟ್ ಗಾತ್ರವನ್ನು ಹೊಂದಿಸಿ.',
  },
};

const DEFAULT_SETTINGS = {
  disabilityTypes: [],
  preferredLanguage: 'English',
  readingLevel: 'Simple',
  fontSize: 'medium', // 'small' | 'medium' | 'large' | 'xlarge'
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  autoReadAloud: false,
  blindAccessibilityMode: false,
};

const FONT_SCALES = {
  small: '0.9rem',
  medium: '1.05rem',
  large: '1.25rem',
  xlarge: '1.45rem',
};

const LINE_HEIGHT_SCALES = {
  small: '1.5',
  medium: '1.65',
  large: '1.8',
  xlarge: '2.0',
};

export const AccessibilityProvider = ({ children }) => {
  const { profile, isAuthenticated, updateProfileLocally } = useAuth();

  const [hasSpokenApproval, setHasSpokenApproval] = useState(() => {
    return localStorage.getItem('accessbridge_audio_approved') === 'true';
  });

  const [showApprovalModal, setShowApprovalModal] = useState(() => {
    return localStorage.getItem('accessbridge_audio_approved') !== 'true';
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('accessbridge_a11y');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Sync profile when user logs in
  useEffect(() => {
    if (profile) {
      setSettings((prev) => {
        const merged = { ...prev, ...profile };
        localStorage.setItem('accessbridge_a11y', JSON.stringify(merged));
        return merged;
      });
    }
  }, [profile]);

  // Apply DOM modifications dynamically whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply font size scale
    const scale = FONT_SCALES[settings.fontSize] || FONT_SCALES.medium;
    const lineHeight = LINE_HEIGHT_SCALES[settings.fontSize] || LINE_HEIGHT_SCALES.medium;
    root.style.setProperty('--text-scale', scale);
    root.style.setProperty('--line-height-scale', lineHeight);

    // Dyslexia-friendly font class
    if (settings.dyslexiaFont) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }

    // High-contrast theme class
    if (settings.highContrast) {
      body.classList.add('high-contrast');
      root.classList.add('dark');
    } else {
      body.classList.remove('high-contrast');
      root.classList.remove('dark');
    }

    // Reduced-motion class
    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }, [settings]);

  // Universal Multilingual Speech Helper
  const speakText = useCallback((text, langName = 'English') => {
    playSpeech(text, langName);
  }, []);

  // Approves speech for blind person / user device
  const approveDeviceAccessibility = useCallback(
    (langOverride) => {
      const targetLang = langOverride || settings.preferredLanguage || 'English';
      localStorage.setItem('accessbridge_audio_approved', 'true');
      setHasSpokenApproval(true);
      setShowApprovalModal(false);

      // Enable auto read-aloud and blind accessibility mode
      setSettings((prev) => {
        const updated = {
          ...prev,
          autoReadAloud: true,
          blindAccessibilityMode: true,
          preferredLanguage: targetLang,
        };
        localStorage.setItem('accessbridge_a11y', JSON.stringify(updated));
        return updated;
      });

      // Play immediate spoken greeting in the chosen language
      const greeting = ACCESSIBLE_GREETINGS[targetLang] || ACCESSIBLE_GREETINGS.English;
      setTimeout(() => {
        speakText(greeting, targetLang);
      }, 100);
    },
    [settings.preferredLanguage, speakText]
  );

  // Update preferences and sync with backend if logged in
  const updateSettings = useCallback(
    async (partialSettings) => {
      setSettings((prev) => {
        const updated = { ...prev, ...partialSettings };
        localStorage.setItem('accessbridge_a11y', JSON.stringify(updated));
        return updated;
      });

      if (isAuthenticated) {
        try {
          const res = await api.put('/profile', partialSettings);
          if (res.data.success && res.data.profile) {
            updateProfileLocally(res.data.profile);
          }
        } catch (error) {
          console.warn('Could not sync accessibility settings with server:', error.message);
        }
      }
    },
    [isAuthenticated, updateProfileLocally]
  );

  // Quick toggle helpers
  const toggleDyslexiaFont = () => updateSettings({ dyslexiaFont: !settings.dyslexiaFont });
  const toggleHighContrast = () => updateSettings({ highContrast: !settings.highContrast });
  const cycleFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const nextIdx = (sizes.indexOf(settings.fontSize) + 1) % sizes.length;
    updateSettings({ fontSize: sizes[nextIdx] });
  };
  const setPreferredLanguage = (lang) => {
    updateSettings({ preferredLanguage: lang });
    // Announce language change aloud in the selected language
    const langChangeNotices = {
      English: `Language set to English`,
      Tamil: `மொழி தமிழுக்கு மாற்றப்பட்டது`,
      Hindi: `भाषा हिन्दी में बदल दी गई है`,
      Telugu: `భాష తెలుగుకి మార్చబడింది`,
      Malayalam: `ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി`,
      Kannada: `ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ`,
    };
    const notice = langChangeNotices[lang] || `Language set to ${lang}`;
    speakText(notice, lang);
  };
  const setReadingLevel = (level) => updateSettings({ readingLevel: level });

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        toggleDyslexiaFont,
        toggleHighContrast,
        cycleFontSize,
        setPreferredLanguage,
        setReadingLevel,
        hasSpokenApproval,
        showApprovalModal,
        setShowApprovalModal,
        approveDeviceAccessibility,
        speakText,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;
