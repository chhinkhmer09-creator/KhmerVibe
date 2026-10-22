import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'km' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  km: {
    // Nav
    'nav.home': 'ទំព័រដើម',
    'nav.shorts': 'វីដេអូខ្លី Shorts',
    'nav.following': 'ការតាមដាន',
    'nav.channel': 'ប៉ុស្តិ៍របស់ខ្ញុំ',
    'nav.upload': 'បង្ហោះវីដេអូ',
    'nav.admin': 'ផ្ទាំងគ្រប់គ្រង Admin',
    'nav.search_placeholder': 'ស្វែងរកវីដេអូ ចំណងជើង ឬអ្នកបង្កើត...',
    'nav.signin': 'ចូលគណនី',
    'nav.signout': 'ចាកចេញ',
    'nav.profile': 'ព័ត៌មានផ្ទាល់ខ្លួន',
    'nav.terms': 'គោលការណ៍សហគមន៍',
    'nav.privacy': 'គោលការណ៍ឯកជនភាព',

    // Feed & Videos
    'feed.explore': 'ស្វែងរកវីដេអូថ្មីៗ',
    'feed.trending': 'ពេញនិយម',
    'feed.shorts_title': 'វីដេអូខ្លីពេញនិយម',
    'feed.views': 'ដង',
    'feed.uploaded': 'បានបង្ហោះ',
    'feed.subscribers': 'អ្នកជាវ',
    'feed.subscribe': 'តាមដាន',
    'feed.subscribed': 'បានតាមដាន',
    'feed.like': 'ចូលចិត្ត',
    'feed.dislike': 'មិនចូលចិត្ត',
    'feed.share': 'ចែករំលែក',
    'feed.save': 'រក្សាទុក',
    'feed.report': 'រាយការណ៍',
    'feed.comments': 'មតិយោបល់',
    'feed.add_comment': 'បន្ថែមមតិយោបល់ជាសាធារណៈ...',
    'feed.post_comment': 'បញ្ចេញមតិ',
    'feed.no_comments': 'មិនទាន់មានមតិយោបល់នៅឡើយទេ។ ជាមនុស្សដំបូងដែលបញ្ចេញមតិ!',
    'feed.empty_title': 'រកមិនឃើញវីដេអូ',
    'feed.empty_desc': 'សូមសាកល្បងស្វែងរកពាក្យគន្លឹះផ្សេង ឬផ្លាស់ប្តូរប្រភេទ។',
    'feed.related': 'វីដេអូស្រដៀងគ្នា',
    'feed.description': 'ការពិពណ៌នា',
    'feed.show_more': 'បង្ហាញបន្ថែម',
    'feed.show_less': 'បង្រួម',

    // Shorts
    'shorts.next': 'វីដេអូបន្ទាប់',
    'shorts.prev': 'វីដេអូមុន',
    'shorts.original_sound': 'សំឡេងដើម - KhmerVibe Music',
    'shorts.pause': 'ផ្អាក',
    'shorts.play': 'ចាក់',
    'shorts.mute': 'បិទសំឡេង',
    'shorts.unmute': 'បើកសំឡេង',

    // Upload
    'upload.title': 'បង្ហោះវីដេអូថ្មី',
    'upload.subtitle': 'ចែករំលែកវីដេអូវែង ឬវីដេអូខ្លី Shorts ទៅកាន់សហគមន៍ KhmerVibe',
    'upload.drag_drop': 'អូសនិងទម្លាក់ឯកសារវីដេអូនៅទីនេះ ឬចុចដើម្បីជ្រើសរើស',
    'upload.supported_formats': 'គាំទ្រឯកសារ MP4, WebM, MOV (ទំហំអតិបរមា 100MB)',
    'upload.video_title': 'ចំណងជើងវីដេអូ (តម្រូវជាចាំបាច់)',
    'upload.title_placeholder': 'ឧ. ទេសភាពថ្ងៃរះនៅប្រាសាទអង្គរវត្ត...',
    'upload.description': 'ការពិពណ៌នា',
    'upload.desc_placeholder': 'សរសេររៀបរាប់អំពីវីដេអូរបស់អ្នក និងស្លាកសញ្ញា #khmervibe...',
    'upload.category': 'ប្រភេទវីដេអូ',
    'upload.type': 'ទម្រង់វីដេអូ',
    'upload.type_long': 'វីដេអូវែង (16:9 Landscape)',
    'upload.type_short': 'វីដេអូខ្លី Shorts (9:16 Vertical)',
    'upload.visibility': 'ភាពមើលឃើញ',
    'upload.public': 'សាធារណៈ (អ្នកគ្រប់គ្នាមើលឃើញ)',
    'upload.unlisted': 'មិនចុះបញ្ជី (អ្នកមានតំណភ្ជាប់អាចមើល)',
    'upload.private': 'ឯកជន (មានតែអ្នកទើបអាចមើលបាន)',
    'upload.thumbnail': 'រូបភាពគម្រប (Thumbnail)',
    'upload.auto_thumb': 'ចាប់យករូបភាពដោយស្វ័យប្រវត្តពីវីដេអូ',
    'upload.custom_thumb': 'ជ្រើសរើសរូបភាពគម្របផ្ទាល់ខ្លួន',
    'upload.btn_upload': 'បោះផ្សាយវីដេអូ',
    'upload.uploading': 'កំពុងផ្ទុកឡើង...',
    'upload.success': 'ការបង្ហោះបានជោគជ័យ!',
    'upload.error': 'មានបញ្ហាក្នុងការបង្ហោះ សូមព្យាយាមម្តងទៀត',
    'upload.cancel': 'បោះបង់',

    // Admin
    'admin.dashboard': 'ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល Admin',
    'admin.stats': 'ស្ថិតិទូទៅប្រព័ន្ធ',
    'admin.total_videos': 'វីដេអូសរុប',
    'admin.total_users': 'អ្នកប្រើប្រាស់',
    'admin.total_views': 'ចំនួនទស្សនាសរុប',
    'admin.pending_reports': 'បណ្តឹងរាយការណ៍រង់ចាំ',
    'admin.video_moderation': 'ការគ្រប់គ្រងវីដេអូ',
    'admin.reports_review': 'ពិនិត្យរបាយការណ៍បណ្តឹង',
    'admin.action': 'សកម្មភាព',
    'admin.hide': 'លាក់វីដេអូ',
    'admin.show': 'បង្ហាញជាសាធារណៈ',
    'admin.delete': 'លុបចេញ',
    'admin.dismiss': 'ច្រានចោល',
    'admin.reviewed': 'បានដោះស្រាយ',
    'admin.unauthorized': 'អ្នកមិនមានសិទ្ធិចូលមើលផ្ទាំងនេះទេ (សម្រាប់តែ Administrator)',

    // General
    'common.search': 'ស្វែងរក',
    'common.filter': 'តម្រង',
    'common.copy_link': 'ចម្លងតំណភ្ជាប់',
    'common.link_copied': 'បានចម្លងតំណភ្ជាប់ជោគជ័យ!',
    'common.report_reason': 'មូលហេតុនៃការរាយការណ៍',
    'common.report_submit': 'ផ្ញើរបាយការណ៍',
    'common.report_success': 'សូមអរគុណ! យើងបានទទួលរបាយការណ៍របស់អ្នកហើយ។',
    'common.close': 'បិទ',
    'common.confirm': 'យល់ព្រម',
    'common.delete_confirm': 'តើអ្នកប្រាកដជាចង់លុបមែនទេ?',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.shorts': 'Shorts',
    'nav.following': 'Following',
    'nav.channel': 'My Channel',
    'nav.upload': 'Upload',
    'nav.admin': 'Admin Dashboard',
    'nav.search_placeholder': 'Search videos, titles, creators...',
    'nav.signin': 'Sign In',
    'nav.signout': 'Sign Out',
    'nav.profile': 'Profile',
    'nav.terms': 'Community Guidelines',
    'nav.privacy': 'Privacy Policy',

    // Feed & Videos
    'feed.explore': 'Explore Videos',
    'feed.trending': 'Trending',
    'feed.shorts_title': 'Trending Shorts',
    'feed.views': 'views',
    'feed.uploaded': 'Uploaded',
    'feed.subscribers': 'subscribers',
    'feed.subscribe': 'Subscribe',
    'feed.subscribed': 'Subscribed',
    'feed.like': 'Like',
    'feed.dislike': 'Dislike',
    'feed.share': 'Share',
    'feed.save': 'Save',
    'feed.report': 'Report',
    'feed.comments': 'Comments',
    'feed.add_comment': 'Add a public comment...',
    'feed.post_comment': 'Comment',
    'feed.no_comments': 'No comments yet. Be the first to comment!',
    'feed.empty_title': 'No Videos Found',
    'feed.empty_desc': 'Try searching with different keywords or choosing another category.',
    'feed.related': 'Related Videos',
    'feed.description': 'Description',
    'feed.show_more': 'Show more',
    'feed.show_less': 'Show less',

    // Shorts
    'shorts.next': 'Next Video',
    'shorts.prev': 'Previous Video',
    'shorts.original_sound': 'Original Audio - KhmerVibe Music',
    'shorts.pause': 'Pause',
    'shorts.play': 'Play',
    'shorts.mute': 'Mute',
    'shorts.unmute': 'Unmute',

    // Upload
    'upload.title': 'Upload New Video',
    'upload.subtitle': 'Share horizontal long videos or vertical 9:16 Shorts with KhmerVibe',
    'upload.drag_drop': 'Drag and drop video files here, or click to browse',
    'upload.supported_formats': 'Supports MP4, WebM, MOV (Max size: 100MB)',
    'upload.video_title': 'Video Title (Required)',
    'upload.title_placeholder': 'e.g. Sunrise over Angkor Wat...',
    'upload.description': 'Description',
    'upload.desc_placeholder': 'Tell viewers about your video and hashtags #khmervibe...',
    'upload.category': 'Category',
    'upload.type': 'Video Format',
    'upload.type_long': 'Long Video (16:9 Landscape)',
    'upload.type_short': 'Short Video (9:16 Vertical)',
    'upload.visibility': 'Visibility',
    'upload.public': 'Public (Anyone can see)',
    'upload.unlisted': 'Unlisted (Anyone with link can see)',
    'upload.private': 'Private (Only you can see)',
    'upload.thumbnail': 'Thumbnail',
    'upload.auto_thumb': 'Auto-captured from video frame',
    'upload.custom_thumb': 'Choose custom thumbnail',
    'upload.btn_upload': 'Publish Video',
    'upload.uploading': 'Uploading...',
    'upload.success': 'Upload completed successfully!',
    'upload.error': 'Upload failed. Please try again.',
    'upload.cancel': 'Cancel',

    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.stats': 'Platform Statistics',
    'admin.total_videos': 'Total Videos',
    'admin.total_users': 'Total Users',
    'admin.total_views': 'Total Views',
    'admin.pending_reports': 'Pending Reports',
    'admin.video_moderation': 'Video Moderation',
    'admin.reports_review': 'Review Reports',
    'admin.action': 'Actions',
    'admin.hide': 'Hide Video',
    'admin.show': 'Make Public',
    'admin.delete': 'Delete',
    'admin.dismiss': 'Dismiss',
    'admin.reviewed': 'Resolved',
    'admin.unauthorized': 'You are not authorized to view this page (Administrator only)',

    // General
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.copy_link': 'Copy Link',
    'common.link_copied': 'Link copied to clipboard!',
    'common.report_reason': 'Reason for reporting',
    'common.report_submit': 'Submit Report',
    'common.report_success': 'Thank you! Your report has been submitted.',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.delete_confirm': 'Are you sure you want to delete this?',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('khmervibe_lang');
    return (saved === 'en' || saved === 'km') ? saved : 'km';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('khmervibe_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['km']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
