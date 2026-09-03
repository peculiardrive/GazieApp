import React, { useState } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, Clock3, AlertCircle, Phone, CreditCard, ShieldAlert, ChevronDown, Star, HelpCircle, ShieldCheck } from 'lucide-react';
import { getStaticMapUrl } from '@/lib/geocoding';

interface TicketProps {
  id?: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  fare?: number;
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'pending' | 'matched' | 'payment_failed';
  role: 'rider' | 'driver' | 'admin';
  riderName?: string;
  riderPhone?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleInfo?: string;
  partnerRating?: number | null;
  isRated?: boolean;
  onRate?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onSelect?: () => void;
  selectLabel?: string;
  showMapPreview?: boolean;
  communityName?: string | null;
}

export default function Ticket({
  id,
  pickup,
  destination,
  date,
  time,
  fare = 0,
  status,
  role,
  riderName,
  riderPhone,
  driverName,
  driverPhone,
  vehicleInfo,
  partnerRating,
  isRated,
  onRate,
  onCancel,
  onComplete,
  onSelect,
  selectLabel,
  showMapPreview = false,
  communityName
}: TicketProps) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showFeeExplanation, setShowFeeExplanation] = useState(false);
  const mapUrl = showMapPreview ? getStaticMapUrl(pickup, destination) : null;

  // Generate a mock ticket serial code from ID
  const ticketCode = id ? `GZ-${id.substring(0, 5).toUpperCase()}` : 'GZ-PILOT';

  // Format Nigerian Naira currency
  const formatFare = (val: number) => {
    return `₦${val.toLocaleString()}`;
  };

  // Status mapping details
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
      case 'matched':
        return {
          bg: 'bg-gazie-green text-white',
          label: 'CONFIRMED MATCH',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'completed':
        return {
          bg: 'bg-gazie-navy text-white opacity-80',
          label: 'TRIP COMPLETED',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'cancelled':
        return {
          bg: 'bg-red-700 text-white',
          label: 'CANCELLED',
          icon: <ShieldAlert className="w-4 h-4" />
        };
      case 'no_show':
        return {
          bg: 'bg-orange-600 text-white',
          label: 'NO SHOW',
          icon: <ShieldAlert className="w-4 h-4" />
        };
      case 'payment_failed':
        return {
          bg: 'bg-red-500 text-white',
          label: 'PAYMENT FAILED',
          icon: <ShieldAlert className="w-4 h-4" />
        };
      case 'requested':
      case 'pending':
      default:
        return {
          bg: 'bg-gazie-yellow text-gazie-navy font-bold',
          label: 'REQUESTED MATCH',
          icon: <Clock3 className="w-4 h-4" />
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="relative w-full max-w-md mx-auto my-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Outer border & shadow */}
      <div className="bg-white border-2 border-gazie-navy rounded-2xl overflow-hidden flex flex-col relative">
        
        {/* Ticket Header Stub */}
        <div className="bg-gazie-navy text-gazie-paper p-3 flex justify-between items-center px-4">
          <span className="font-mono text-xs tracking-widest font-bold">{ticketCode}</span>
          <span className="font-display text-sm font-semibold tracking-wider">GAZIE COMMUTE PASS</span>
          <div className="w-2 h-2 rounded-full bg-gazie-yellow animate-ping" />
        </div>

        {/* Optional Community Hub Badge */}
        {communityName && (
          <div className="bg-[#2D6A4F]/10 border-b border-[#2D6A4F]/20 px-4 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#2D6A4F]">
            <span className="flex items-center gap-1.5">
              <span>⛪</span>
              <span>{communityName}</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider bg-[#2D6A4F]/20 px-2 py-0.5 rounded-full font-extrabold">Verified Community Match</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 flex-1">
          {/* Route Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-gazie-navy bg-gazie-yellow" />
                <div className="w-0.5 h-10 bg-dashed border-l border-gazie-navy my-1" />
                <div className="w-3 h-3 rounded-full border-2 border-gazie-navy bg-gazie-navy" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-gazie-navy opacity-60 uppercase block tracking-wider">PICKUP POINT</span>
                  <span className="font-sans text-sm font-semibold text-gazie-navy">{pickup}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gazie-navy opacity-60 uppercase block tracking-wider">DESTINATION</span>
                  <span className="font-sans text-sm font-semibold text-gazie-navy">{destination}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Date */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gazie-navy opacity-70" />
              <div>
                <span className="text-[9px] text-gazie-navy opacity-60 block tracking-wider">COMMUTE DATE</span>
                <span className="font-mono text-xs font-bold">{date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gazie-navy opacity-70" />
              <div>
                <span className="text-[9px] text-gazie-navy opacity-60 block tracking-wider">DEPARTURE</span>
                <span className="font-mono text-xs font-bold">{time}</span>
              </div>
            </div>
          </div>

          {/* User Specific Additional Match Info */}
          {(status === 'matched' || status === 'confirmed') && (
            <div className="mt-4 p-3 bg-gazie-paper border border-gazie-navy/20 rounded-xl space-y-2">
              {role === 'rider' && driverName && (
                <>
                  <div className="flex items-center justify-between text-xs border-b border-dashed border-gazie-navy/10 pb-1">
                    <span className="font-semibold text-gazie-navy">Driver:</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{driverName}</span>
                      {typeof partnerRating === 'number' && partnerRating > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-100/80 border border-amber-300 px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {partnerRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {vehicleInfo && (
                    <div className="flex items-center justify-between text-xs border-b border-dashed border-gazie-navy/10 pb-1">
                      <span className="font-semibold text-gazie-navy">Vehicle:</span>
                      <span className="font-mono text-[10px] bg-gazie-navy text-gazie-paper px-1.5 py-0.5 rounded font-bold">
                        {vehicleInfo}
                      </span>
                    </div>
                  )}
                  {driverPhone && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-1">
                      <span className="font-semibold text-gazie-navy">Driver Contact:</span>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${driverPhone}`} className="font-mono font-bold text-gazie-navy underline flex items-center gap-1">
                          <Phone className="w-3 h-3 inline" /> {driverPhone}
                        </a>
                        <a 
                          href={`https://wa.me/${driverPhone.replace(/^0/, '234').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(driverName || 'Driver')}%2C%20I%20am%20your%20matched%20passenger%20on%20Gazie%20Commute`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-[#2D6A4F] text-white font-bold text-[10px] flex items-center gap-1 hover:opacity-90 transition"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {role === 'driver' && riderName && (
                <>
                  <div className="flex items-center justify-between text-xs border-b border-dashed border-gazie-navy/10 pb-1">
                    <span className="font-semibold text-gazie-navy">Rider:</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{riderName}</span>
                      {typeof partnerRating === 'number' && partnerRating > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-100/80 border border-amber-300 px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {partnerRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {riderPhone && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-1">
                      <span className="font-semibold text-gazie-navy">Rider Contact:</span>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${riderPhone}`} className="font-mono font-bold text-gazie-navy underline flex items-center gap-1">
                          <Phone className="w-3 h-3 inline" /> {riderPhone}
                        </a>
                        <a 
                          href={`https://wa.me/${riderPhone.replace(/^0/, '234').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(riderName || 'Rider')}%2C%20I%20am%20your%20matched%20driver%20on%20Gazie%20Commute`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-[#2D6A4F] text-white font-bold text-[10px] flex items-center gap-1 hover:opacity-90 transition"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {role === 'admin' && (
                <div className="text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Rider:</span>
                    <span>{riderName} ({riderPhone})</span>
                  </div>
                  {driverName && (
                    <div className="flex justify-between border-t border-dotted border-gazie-navy/10 pt-1">
                      <span className="font-semibold">Driver:</span>
                      <span>{driverName} ({driverPhone})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Locked Notice Block */}
          {status === 'requested' && role === 'rider' && (
            <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>MATCH READY TO UNLOCK (₦100)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeeExplanation(!showFeeExplanation)}
                  className="text-[10px] font-bold text-amber-900 underline hover:text-amber-950 flex items-center gap-0.5 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showFeeExplanation ? 'Hide info' : 'Why ₦100 fee?'}</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-900/80 leading-relaxed">
                Pay the ₦100 match unlock fee to lock in your seat and reveal your verified driver's phone number. Fuel contribution is paid directly to your driver.
              </p>
              {showFeeExplanation && (
                <div className="mt-2 p-2.5 bg-white border border-amber-300 rounded-lg text-left text-[10px] text-gazie-navy/80 space-y-1 animate-fadeIn shadow-xs">
                  <div className="font-extrabold text-gazie-navy flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gazie-green" />
                    What the ₦100 unlock fee covers:
                  </div>
                  <p>• <strong>Verified Security:</strong> Covers NIN & driver licence verification so you commute safely.</p>
                  <p>• <strong>Guaranteed Seat:</strong> Reserves your seat the day before so the driver saves it exclusively for you.</p>
                  <p>• <strong>0% Driver Commission:</strong> 100% of your fuel fare (e.g. ₦1,000) goes directly to your driver.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- PERFORATED DIVIDER SPLIT --- */}
        <div className="relative my-1">
          {/* Left Cutout Punch Hole */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gazie-paper border-r-2 border-gazie-navy z-10" />
          {/* Right Cutout Punch Hole */}
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gazie-paper border-l-2 border-gazie-navy z-10" />
          {/* Dashed Line */}
          <div className="w-full border-t-2 border-dashed border-gazie-navy/30" />
        </div>

        {/* Tear-Off / Fare Section */}
        <div className="p-4 bg-gazie-paper/30 flex flex-col gap-3 px-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] text-gazie-navy opacity-60 block tracking-wider uppercase">FUEL CONTRIBUTION (CASH/TRANSFER)</span>
              <span className="font-mono text-lg font-bold text-gazie-navy">
                {status === 'pending' || (!fare && (!driverPhone || driverName === 'Awaiting Admin Match')) || (fare === 0 && (!driverPhone || driverName === 'Awaiting Admin Match')) ? (
                  <span className="font-sans text-xs font-bold text-gazie-navy/80">Fare to be Agreed with Driver</span>
                ) : fare === 0 ? (
                  <span className="font-sans text-xs font-bold text-[#2D6A4F]">FREE (No Charge)</span>
                ) : (
                  formatFare(fare)
                )}
              </span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${statusConfig.bg}`}>
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </div>
          </div>

          {/* Action buttons if available */}
          {(((status === 'pending' || status === 'matched' || status === 'completed') && (onCancel || onComplete || onRate)) || onSelect) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {status === 'matched' && role === 'driver' && onComplete && (
                <button
                  onClick={onComplete}
                  className="flex-1 min-w-[120px] text-[11px] font-bold bg-gazie-green text-white py-1.5 rounded-lg border border-gazie-green hover:bg-gazie-navy hover:text-white transition-all duration-200 cursor-pointer"
                >
                  Mark Completed
                </button>
              )}
              {onRate && (
                <button
                  onClick={onRate}
                  className={`flex-1 min-w-[120px] text-[11px] font-bold py-1.5 px-3 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 shadow-sm ${
                    isRated 
                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      : 'bg-gazie-yellow text-gazie-navy border-gazie-navy hover:bg-gazie-navy hover:text-gazie-paper'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isRated ? 'fill-amber-500 text-amber-500' : 'fill-gazie-navy text-gazie-navy'}`} />
                  {isRated ? 'Rated ✓' : 'Rate Commute'}
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 min-w-[100px] text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-center text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  Cancel
                </button>
              )}
              {onSelect && (
                <div className="flex-1 flex items-center gap-1.5">
                  <button
                    onClick={onSelect}
                    className="flex-1 min-w-[120px] text-[11px] font-bold bg-gazie-navy text-gazie-paper border border-gazie-navy hover:bg-gazie-yellow hover:text-gazie-navy py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-center text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    {selectLabel || 'Select Commute'}
                  </button>
                  {selectLabel?.includes('100') && !showFeeExplanation && (
                    <button
                      type="button"
                      onClick={() => setShowFeeExplanation(true)}
                      className="px-2 py-1.5 rounded-lg border border-gazie-navy/20 bg-white text-gazie-navy text-[10px] font-bold hover:bg-gazie-paper/60 transition cursor-pointer shrink-0 flex items-center gap-0.5"
                      title="Why the ₦100 unlock fee?"
                    >
                      <HelpCircle className="w-3 h-3 text-gazie-navy/60" />
                      <span className="hidden sm:inline">Why ₦100?</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Preview Toggle — only rendered if coordinates are available */}
        {showMapPreview && mapUrl && (
          <div className="border-t border-dashed border-gazie-navy/20">
            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setIsMapExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gazie-paper/40 hover:bg-gazie-paper/70 transition-colors duration-200 cursor-pointer group"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gazie-navy/60 group-hover:text-gazie-navy transition-colors">
                <MapPin className="w-3 h-3" />
                View route on map
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gazie-navy/50 transition-transform duration-300 ${isMapExpanded ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>

            {/* Expandable map drawer */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isMapExpanded ? 'max-h-[180px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="relative bg-gazie-paper rounded-b-2xl overflow-hidden" style={{ height: '150px' }}>
                {isMapExpanded && (
                  <img
                    src={mapUrl}
                    alt={`Route from ${pickup} to ${destination}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#FBF7EE;color:#14213D;font-size:11px;font-weight:600;opacity:0.5;gap:6px;">
                          Map preview unavailable
                        </div>`;
                    }}
                  />
                )}
                {/* Overlay labels */}
                {isMapExpanded && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2">
                    <span className="self-start bg-gazie-navy text-gazie-paper text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      ● {pickup}
                    </span>
                    <span className="self-end bg-gazie-yellow text-gazie-navy text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      ■ {destination}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
