import React from 'react';
import PrintButton from './PrintButton';
import PrintStyles from './PrintStyles';
import signatureImage from '../images/images.png';

const HallBookingForm = ({ selectedEvent }) => {
  const halls = [
    [
      { name: 'Platinum Hall', desc: '(Digi Theater)' },
      { name: 'Titanium Hall', desc: '(AB II - Gallery Hall)' },
      { name: 'Adithya Hall', desc: '(KSRCE - IQAC Hall)' },
      { name: 'Hemavathi Hall', desc: '(Hemavathi Hall - C Block)' }
    ],
    [
      { name: 'Pearl Hall', desc: '(ECE)' },
      { name: 'Sapphire Hall', desc: '(EEE)' },
      { name: 'Edison Hall', desc: '(Choesti Court - A Block)' },
      { name: 'Mount Everest Hall', desc: '(Conference Hall - C Block)' }
    ],
    [
      { name: 'Diamond Hall', desc: '(MECH)' },
      { name: 'Emerald Hall', desc: '(CSE)' },
      { name: 'Dharmavathi Hall', desc: '(Seminar Hall - B Block)' },
      { name: 'Chandrayan Hall', desc: '(Multi Utility Hall - F Block)' }
    ],
    [
      { name: 'Garnet Hall', desc: '(IT)' },
      { name: 'Citrine Hall', desc: '(Conference Hall)' },
      { name: 'Dhenuka Hall', desc: '(Dhenuka Hall - C Block)' },
      { name: 'Darbar Hall', desc: '(Darbar Hall - C Block)' }
    ],
    [
      { name: 'Spinel Hall', desc: '(Mini Conference Hall)' },
      { name: 'Ruby Hall', desc: '(KSRIET - IQAC Conference Hall)' },
      { name: 'Display Hall', desc: '' }
    ]
  ];

  return (
    <div className="p-4">
      <PrintStyles />
      <PrintButton />

      <div
        id="printSection"
        className="w-[210mm] mx-auto bg-white p-4"
        style={{ 
          height: '297mm',
          overflow: 'hidden',
          pageBreakAfter: 'avoid',
          pageBreakBefore: 'avoid',
          pageBreakInside: 'avoid'
        }}
      >
        <div className="border border-black h-full p-6 relative">
          <div className="absolute top-4 right-4">
            <div className="border border-black px-3 py-1">
              FORM - I
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold tracking-wide">
              K.S.R. COLLEGE OF ENGINEERING
            </h1>
            <h2 className="text-sm mt-1">
              TIRUCHENGODE - 637 215
            </h2>
            <h3 className="text-lg font-bold mt-4 underline">
              HALL BOOKING FORM
            </h3>
          </div>

          <div className="space-y-4" style={{ marginBottom: '160px' }}>
            <div className="flex items-center">
              <label className="w-48">Name of the Faculty</label>
              <span className="px-2">:</span>
              <div className="flex-1 border-b border-black">
                {selectedEvent?.name || ''}
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-48">Name of the Department</label>
              <span className="px-2">:</span>
              <div className="flex-1 border-b border-black">
                {selectedEvent?.department || ''}
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-48">Contact Number</label>
              <span className="px-2">:</span>
              <div className="flex-1 border-b border-black">
                {selectedEvent?.phone || ''}
              </div>
            </div>

            <div>
              <div className="flex mb-4">
                <label>Name of the Seminar Hall (✓)</label>
              </div>
              <div className="space-y-4 pl-4">
                {halls.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-8">
                    {row.map(hall => (
                      <div key={hall.name} className="flex items-start gap-2 w-56">
                        <input
                          type="checkbox"
                          checked={selectedEvent?.hallName === hall.name}
                          readOnly
                          className="mt-1.5 h-4 w-4"
                        />
                        <div>
                          <div className="text-sm">{hall.name}</div>
                          <div className="text-xs text-gray-600">{hall.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-48">Programme Date & Time</label>
              <span className="px-2">:</span>
              <div className="flex-1 border-b border-black">
                {selectedEvent
                  ? `${selectedEvent.date} | ${selectedEvent.startTime} - ${selectedEvent.endTime}`
                  : ''}
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-48">Purpose</label>
              <span className="px-2">:</span>
              <div className="flex-1 border-b border-black">
                {selectedEvent?.eventName || ''}
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, padding: '0 24px' }}>
            <div className="grid grid-cols-3 gap-8 items-end">
              <div className="flex flex-col items-center">
                <div className="h-16"></div>
                <div className="font-bold">FACULTY SIGNATURE</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16"></div>
                <div className="font-bold">HOD/DIRECTOR</div>
              </div>
              <div className="flex flex-col items-center">
                <img src={signatureImage} alt="Signature" className="h-16" />
                <div className="font-bold">HALL INCHARGE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallBookingForm;