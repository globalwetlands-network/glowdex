import { X, ExternalLink, Mail } from 'lucide-react';
import {
  MENU_CONTENT,
  REFERENCES,
  TERMINOLOGY,
  PARTNERS,
  type MenuItemKey,
} from '@/app/content/menuContent';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: MenuItemKey | null;
}

export function MenuDrawer({ isOpen, onClose, activeItem }: MenuDrawerProps) {
  if (!isOpen || !activeItem) return null;

  const content = MENU_CONTENT[activeItem];

  const renderAbout = () => (
    <div className="px-6 py-6 space-y-6">
      <p className="text-base font-medium text-gray-800 leading-relaxed">
        {MENU_CONTENT.about.lead}
      </p>

      {MENU_CONTENT.about.body.split('\n\n').map((paragraph, index) => (
        <p key={index} className="text-sm text-gray-600 leading-relaxed">
          {paragraph}
        </p>
      ))}

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2 mb-4">
          Research Partners
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {PARTNERS.map((partner, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="text-xs font-semibold text-gray-800 leading-snug">
                {partner.name}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {partner.region}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="px-6 py-6 space-y-5">
      {MENU_CONTENT.help.sections.map((section, index) => (
        <div key={index}>
          {section.heading && (
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              {section.heading}
            </h3>
          )}
          <p className="text-sm text-gray-600 leading-relaxed">
            {section.body}
          </p>
        </div>
      ))}
    </div>
  );

  const renderMethods = () => (
    <div className="px-6 py-6 space-y-8">
      {/* Terminology Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Terminology
        </h3>
        <div className="space-y-4">
          {TERMINOLOGY.map((item, index) => (
            <div key={index} className="border-l-2 border-[#0a5c47] pl-4">
              <div className="text-sm font-semibold text-gray-800">
                {item.term}
              </div>
              <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                {item.definition}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* References Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          References
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Please cite Sievers et al. (in review) Ecological Indicators if you
          use outputs from this app.
        </p>
        <div className="space-y-3">
          {REFERENCES.map((ref) => (
            <div key={ref.id} className="flex gap-3 items-baseline">
              <span className="text-xs text-gray-300 font-mono shrink-0 w-5 text-right">
                [{ref.id}]
              </span>
              <span className="text-xs text-gray-600 leading-relaxed">
                {ref.citation}
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 inline-flex items-center text-[#0a5c47] hover:text-[#0f6e56]"
                  >
                    <ExternalLink size={10} />
                  </a>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="px-6 py-6">
      <p className="text-sm text-gray-600 leading-relaxed mb-6">
        {MENU_CONTENT.contact.body}
      </p>

      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 flex items-center gap-4">
        <Mail size={20} className="text-gray-300" />
        <div>
          <div className="text-sm font-medium text-gray-400">
            Contact details coming soon
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            This section will be updated with direct contact information for the
            GLOWdex team.
          </div>
        </div>
      </div>
    </div>
  );

  const renderLicence = () => (
    <div className="px-6 py-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          MIT License
        </span>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">
        Copyright © {MENU_CONTENT.licence.year} {MENU_CONTENT.licence.holder}
      </p>

      <div className="border-t border-gray-100" />

      <div className="text-xs text-gray-400 leading-relaxed space-y-3">
        <p>
          Permission is hereby granted, free of charge, to any person obtaining
          a copy of this software and associated documentation files (the
          "Software"), to deal in the Software without restriction, including
          without limitation the rights to use, copy, modify, merge, publish,
          distribute, sublicense, and/or sell copies of the Software, and to
          permit persons to whom the Software is furnished to do so, subject to
          the following conditions:
        </p>
        <p>
          The above copyright notice and this permission notice shall be
          included in all copies or substantial portions of the Software.
        </p>
        <p>
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeItem) {
      case 'about':
        return renderAbout();
      case 'help':
        return renderHelp();
      case 'methods':
        return renderMethods();
      case 'contact':
        return renderContact();
      case 'licence':
        return renderLicence();
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[480px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-[#0a5c47] px-6 py-5 flex items-center justify-between shrink-0">
          <h2 className="text-white text-base font-semibold tracking-wide">
            {content.title}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </>
  );
}
