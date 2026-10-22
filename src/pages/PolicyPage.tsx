import React, { useState } from 'react';
import { FileText, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PolicyPageProps {
  initialTab?: 'terms' | 'privacy';
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ initialTab = 'terms' }) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
            {lang === 'km' ? 'គោលការណ៍ និងច្បាប់សហគមន៍' : 'KhmerVibe Policies & Guidelines'}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            KhmerVibe Platform • Legal & Community Standards
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-neutral-800 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 pb-3 transition-colors relative ${
            activeTab === 'terms' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('nav.terms')}</span>
          {activeTab === 'terms' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400" />}
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 pb-3 transition-colors relative ${
            activeTab === 'privacy' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t('nav.privacy')}</span>
          {activeTab === 'privacy' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400" />}
        </button>
      </div>

      {activeTab === 'terms' ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-base sm:text-lg font-bold text-neutral-100">
            {lang === 'km' ? '១. គោលការណ៍សហគមន៍ KhmerVibe' : '1. KhmerVibe Community Guidelines'}
          </h2>
          <p>
            {lang === 'km'
              ? 'KhmerVibe ត្រូវ​បាន​បង្កើត​ឡើង​ដើម្បី​លើកកម្ពស់​វប្បធម៌ សិល្បៈ ការអប់រំ និងការកម្សាន្តប្រកបដោយភាពច្នៃប្រឌិតរបស់ប្រជាជនកម្ពុជា និងអ្នកបង្កើតមាតិកាជុំវិញពិភពលោក។ អ្នកប្រើប្រាស់ទាំងអស់ត្រូវគោរពតាមគោលការណ៍ខាងក្រោម៖'
              : 'KhmerVibe is built to celebrate Cambodian culture, art, education, and creative storytelling. All creators and viewers must uphold high standards of integrity:'}
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <h3 className="font-bold text-amber-400 mb-1">
                {lang === 'km' ? 'ក. ការគោរពកម្មសិទ្ធិបញ្ញា (Copyright)' : 'A. Copyright Protection'}
              </h3>
              <p className="text-neutral-400">
                {lang === 'km'
                  ? 'ហាមឃាត់ការលួចចម្លង ឬបង្ហោះវីដេអូ ចម្រៀង ឬស្នាដៃរបស់អ្នកដទៃដោយគ្មានការអនុញ្ញាត។'
                  : 'Only upload videos and audio that you created or hold authorized distribution licenses for.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <h3 className="font-bold text-amber-400 mb-1">
                {lang === 'km' ? 'ខ. ការពារសុវត្ថិភាព និងការគោរពគ្នា' : 'B. Safety & Harassment'}
              </h3>
              <p className="text-neutral-400">
                {lang === 'km'
                  ? 'ហាមដាច់ខាតនូវខ្លឹមសារស្អប់ខ្ពើម ការបៀតបៀន ការគំរាមកំហែង ឬខ្លឹមសារអាសអាភាស។'
                  : 'Zero tolerance for hate speech, harassment, cyberbullying, or illicit content.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <h3 className="font-bold text-amber-400 mb-1">
                {lang === 'km' ? 'គ. វប្បធម៌ និងប្រពៃណីខ្មែរ' : 'C. Respect for Cultural Heritage'}
              </h3>
              <p className="text-neutral-400">
                {lang === 'km'
                  ? 'លើកទឹកចិត្តដល់ការផលិតវីដេអូដែលបង្ហាញពីភាពស្រស់ស្អាតនៃប្រទេសកម្ពុជា ប្រាសាទបុរាណ ម្ហូបអាហារ និងកីឡាគុនខ្មែរ។'
                  : 'We encourage positive showcasing of Cambodian heritage, temples, gastronomy, arts, and Kun Khmer sports.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-base sm:text-lg font-bold text-neutral-100">
            {lang === 'km' ? '២. គោលការណ៍ឯកជនភាព និងទិន្នន័យ' : '2. Privacy & Data Policy'}
          </h2>
          <p>
            {lang === 'km'
              ? 'KhmerVibe យកចិត្តទុកដាក់ខ្ពស់ចំពោះការការពារទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកប្រើប្រាស់។ ព័ត៌មានសម្ងាត់ អាសយដ្ឋានអ៊ីមែល និងលេខកូដសុវត្ថិភាព ត្រូវបានរក្សាទុកដោយប្រុងប្រយ័ត្ន។'
              : 'KhmerVibe prioritizes user privacy and zero-trust data protection. User credentials, email addresses, and media files are stored securely.'}
          </p>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <h3 className="font-bold text-amber-400">
              {lang === 'km' ? 'ការគ្រប់គ្រងទិន្នន័យវីដេអូ' : 'Video Data Handling'}
            </h3>
            <p className="text-neutral-400">
              {lang === 'km'
                ? 'វីដេអូដែលអ្នកបានបង្ហោះត្រូវបានរក្សាទុកលើប្រព័ន្ធ Object Storage សុវត្ថិភាពខ្ពស់។ អ្នកអាចលុបវីដេអូរបស់អ្នកនៅពេលណាក៏បាន។'
                : 'Uploaded videos are handled strictly via object storage streaming adapters and Firestore metadata. You retain ownership and can modify or delete your videos at any time.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
