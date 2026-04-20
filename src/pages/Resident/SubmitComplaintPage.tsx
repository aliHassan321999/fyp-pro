import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ImagePlus, CheckCircle, Mic, MicOff, MapPin, AlertCircle, Edit3, ShieldCheck, Droplet, Zap, Loader2, X, FileText } from 'lucide-react';
import { Button, Card } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useCreateComplaintMutation } from '@/features/complaint/complaint.api';
import { showSuccess, showError } from '@/utils/toast';

// Native Web Speech Integration Map
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();

  // Network Mappings
  const [createComplaint, { isLoading: isSubmitting }] = useCreateComplaintMutation();

  // State Machine Architecture: input -> confirm -> success
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [successPayload, setSuccessPayload] = useState<any>(null); 
  const [apiError, setApiError] = useState<string>('');
  
  // Form Payload Constraints
  const [formData, setFormData] = useState({ description: '' });
  const [images, setImages] = useState<File[]>([]);
  const [coordinates, setCoordinates] = useState<{lat: number | null, lng: number | null}>({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Visual Image Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Web Speech Specific Maps
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const recognitionRef = useRef<any>(null);
  const supportsSpeech = !!SpeechRecognition;

  useEffect(() => {
    if (supportsSpeech) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; 

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setFormData(prev => ({ ...prev, description: prev.description + (prev.description ? ' ' : '') + finalTranscript.trim() }));
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech API Error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [supportsSpeech]);

  const toggleListening = () => {
    if (!supportsSpeech || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ description: e.target.value });
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const validFiles: File[] = [];
      let sizeError = false;

      selectedFiles.forEach(file => {
         if (file.size > 5 * 1024 * 1024) sizeError = true;
         else validFiles.push(file);
      });

      if (sizeError) showError("One or more images exceeded the 5MB limit and were skipped.");
      
      setImages(prev => {
        const combo = [...prev, ...validFiles];
        // Enforce max 3 strict
        if (combo.length > 3) {
          showError("Maximum 3 images allowed.");
          return combo.slice(0, 3);
        }
        return combo;
      });
      
      // Reset input block natively
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const constructCaptureGeo = () => {
     setIsLocating(true);
     if (!navigator.geolocation) {
       showError("Geolocation constraints denied by environment.");
       setIsLocating(false);
       return;
     }

     navigator.geolocation.getCurrentPosition(
       (position) => {
         setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
         setIsLocating(false);
         if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
       },
       (error) => {
         console.error(error);
         showError("Failed to map coordinates natively.");
         setIsLocating(false);
       }
     );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Please provide the details of your complaint.';
    if (!coordinates.lat || !coordinates.lng) newErrors.location = 'Please capture your precise location target.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const autoTitle = formData.description.split(' ').slice(0, 5).join(' ') + (formData.description.split(' ').length > 5 ? '...' : '');

  const proceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) toggleListening();
    if (validateForm()) {
        setStep('confirm');
    }
  };

  const executeFinalSubmit = async () => {
    setApiError('');
    try {
      const payload = new FormData();
      payload.append('title', autoTitle || 'Automated Voice Entry');
      payload.append('description', formData.description);
      payload.append('departmentId', '67b7ddf2bbbe01ba7aaadceb'); // Default Maintenance Dept Mock
      payload.append('priority', 'medium');
      
      if (coordinates.lat && coordinates.lng) {
        payload.append('lat', coordinates.lat.toString());
        payload.append('lng', coordinates.lng.toString());
      }
      images.forEach(img => payload.append('images', img));

      const result = await createComplaint(payload).unwrap();
      setSuccessPayload(result.data || result);
      showSuccess("Complaint submitted natively");
      setTimeout(() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS), 4000);
      
    } catch (error: any) {
      const msg = error?.data?.message || 'Express Native validation engine rejected query array.';
      setApiError(msg);
      showError("Failed to deploy target map");
      setStep('input');
    }
  };

  const calculateProgress = () => {
    let progress = 0;
    if (formData.description.trim().length > 5) progress += 33;
    if (images.length > 0) progress += 33;
    if (coordinates.lat && coordinates.lng) progress += 34;
    return progress;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 md:py-16">
        <div className="w-full max-w-2xl px-4 md:px-0">
          
          {successPayload && (
            <Card variant="lg" className="p-10 border-t-8 border-t-blue-600 bg-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
               <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-6" />
               <h2 className="text-3xl font-bold text-slate-800 text-center tracking-tight mb-2">Issue Successfully Captured</h2>
               <p className="text-slate-500 text-center mb-8">Our intelligent engine has structured and routed your request for immediate assessment.</p>
               
               <div className="bg-[#F1F5F9] rounded-2xl p-6">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Reference ID</p>
                 <p className="text-xl font-mono font-bold text-slate-800">{successPayload._id}</p>
                 
                 <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Classification Status</p>
                    <span className="inline-flex items-center gap-1.5 bg-blue-100/80 text-blue-800 font-bold text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3"/> {successPayload.status}
                    </span>
                 </div>
               </div>
            </Card>
          )}

          {!successPayload && (
             <>
              <div className="mb-12 text-center relative">
                <div className="relative w-32 h-32 mx-auto mb-8 flex justify-center items-center">
                   <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-75"></div>
                   <div className="absolute w-24 h-24 bg-blue-100 rounded-full animate-pulse opacity-80"></div>
                   <div className="relative z-10 w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-1">
                        {[1,2,3,4,5,6,7,8,9].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        ))}
                      </div>
                   </div>
                </div>

                <h1 className="text-[2.75rem] leading-tight font-extrabold text-slate-900 tracking-tight mb-4">What demands our attention?</h1>
                <p className="text-slate-500 text-[1.1rem] max-w-lg mx-auto leading-relaxed mt-2">
                  Detail the anomaly below. Our cognitive processor will instantly extract the context and deploy the appropriate resolution protocols.
                </p>
              </div>

              {apiError && (
                 <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 shadow-sm flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5"/>
                   <div><h3 className="font-bold mb-1">Upload Pipeline Exception</h3><p className="text-sm">{apiError}</p></div>
                 </div>
              )}

              {step === 'input' && (
                <Card variant="lg" className="p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 bg-white animate-in fade-in duration-500 max-w-2xl mx-auto">
                  <form onSubmit={proceedToConfirmation} className="space-y-12">
                    
                    {/* Intelligent Input Wrapper */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">1</div>
                         <h2 className="text-lg font-black text-slate-800 tracking-tight">Issue Details</h2>
                      </div>
                      
                      <div className={`relative bg-[#F8FAFC] rounded-[1.5rem] border-2 transition-all duration-300 ${isListening ? 'border-red-300 bg-red-50/30' : 'border-slate-100 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-500/5'}`}>
                        
                        <div className="flex">
                           {/* Left Mic Control Area */}
                           <div className="w-20 pt-6 flex flex-col items-center border-r border-slate-200/50">
                             <button
                                type="button"
                                onClick={toggleListening}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                  isListening 
                                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                                  : 'bg-white text-blue-600 shadow-sm hover:shadow hover:text-blue-700'
                                }`}
                              >
                                {isListening ? <div className="w-6 h-6 flex items-center justify-center gap-1"><div className="w-1 h-3 bg-white animate-bounce"></div><div className="w-1 h-5 bg-white animate-bounce delay-75"></div><div className="w-1 h-3 bg-white animate-bounce delay-150"></div></div> : <Mic className="w-5 h-5" />}
                              </button>
                           </div>

                           {/* Text Area Core */}
                           <div className="flex-1 p-6 pl-5 relative">
                              <textarea
                                name="description"
                                placeholder={isListening ? "Listening natively..." : "Type or speak the details of your issue..."}
                                value={formData.description}
                                onChange={handleTextChange}
                                rows={4}
                                className="w-full bg-transparent text-slate-700 text-[1.1rem] font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none resize-none leading-relaxed"
                              />
                              {isListening && <p className="absolute bottom-2 right-4 text-xs font-bold text-red-500 animate-pulse">🎤 Listening active...</p>}
                           </div>
                        </div>
                      </div>
                      {errors.description && <p className="text-red-500 text-sm font-bold pl-12">{errors.description}</p>}
                    </div>

                    <hr className="border-slate-100 border-2 rounded-full" />

                    {/* Multi-Media Row */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm">2</div>
                           <h2 className="text-lg font-black text-slate-800 tracking-tight">Visual Evidence</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Max 3 / 5MB</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 ml-[2.75rem]">
                         <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                         
                         {images.map((img, i) => (
                           <div key={i} className="aspect-square rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-300 relative group overflow-hidden border-2 border-transparent hover:border-slate-300 transition-colors">
                             <img src={URL.createObjectURL(img)} alt="temp" className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
                             <button type="button" onClick={() => removeImage(i)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur text-red-500 rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg"><X className="w-4 h-4"/></button>
                           </div>
                         ))}

                         {images.length < 3 && (
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[1.25rem] border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors flex flex-col items-center justify-center text-slate-400 gap-3 group">
                             <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImagePlus className="w-5 h-5"/>
                             </div>
                             <span className="text-xs font-bold">Add Photo</span>
                           </button>
                         )}
                         
                         {/* Placeholder slots to ensure strict 3-grid visual alignment */}
                         {Array.from({ length: Math.max(0, 3 - images.length - 1) }).map((_, i) => (
                           <div key={`placeholder-${i}`} className="aspect-square rounded-[1.25rem] bg-slate-50 border-2 border-transparent flex items-center justify-center">
                             <ImagePlus className="w-6 h-6 text-slate-200"/>
                           </div>
                         ))}
                      </div>
                    </div>

                    <hr className="border-slate-100 border-2 rounded-full" />

                    {/* Location Context Vector */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm">3</div>
                         <h2 className="text-lg font-black text-slate-800 tracking-tight">Location Target</h2>
                      </div>
                      
                      <div className="ml-[2.75rem]">
                        <button 
                           type="button" 
                           onClick={constructCaptureGeo} 
                           disabled={isLocating}
                           className="relative w-full h-[200px] rounded-[1.5rem] bg-slate-900 overflow-hidden shadow-lg flex flex-col items-center justify-center group border-4 border-transparent hover:border-blue-500/20 transition-all cursor-pointer"
                        >
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #4B5563 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                          
                          <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.8)] transition-transform duration-500 ${coordinates.lat ? 'bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)]' : 'bg-blue-600 group-hover:-translate-y-2'}`}>
                             {isLocating ? (
                               <Loader2 className="w-6 h-6 text-white animate-spin" />
                             ) : coordinates.lat ? (
                               <CheckCircle className="w-7 h-7 text-white" />
                             ) : (
                               <MapPin className="w-7 h-7 text-white" />
                             )}
                             <div className={`absolute -bottom-2 w-4 h-4 rotate-45 transform origin-center ${coordinates.lat && !isLocating ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                          </div>

                          {coordinates.lat && (
                             <div className="mt-6 z-10 bg-black/40 backdrop-blur px-4 py-2 rounded-full border border-white/10 font-mono text-sm tracking-widest text-green-400">
                               [{coordinates.lat.toFixed(5)}, {coordinates.lng!.toFixed(5)}]
                             </div>
                          )}
                        </button>
                        {errors.location && <p className="text-red-500 text-sm font-bold mt-3">{errors.location}</p>}
                      </div>
                    </div>
                    
                    {/* Submission Row */}
                    <div className="pt-8 pb-2 flex flex-col items-center gap-6 border-t-[3px] border-slate-50 mt-10">
                      
                      {/* Status Tracker Relocated */}
                      <div className="w-full max-w-sm flex flex-col gap-2 p-5 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl">
                        <div className="flex justify-between items-end">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Submission Status</p>
                          <p className="text-sm font-bold text-blue-600">{calculateProgress()}%</p>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.max(5, calculateProgress())}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border border-green-100 rounded-full">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-black text-green-700 uppercase tracking-widest">Private & Encrypted Node</span>
                      </div>

                      <Button
                        type="submit"
                        className="w-full max-w-sm py-5 bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 font-bold text-lg rounded-[1.25rem] shadow-[0_8px_30px_rgba(37,99,235,0.25)] transition-all flex justify-center items-center gap-2 group mx-auto"
                      >
                        Authenticate Deploy <Send className="w-5 h-5 transition-transform group-hover:translate-x-1.5"/>
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {step === 'confirm' && (
                <Card variant="lg" className="p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 bg-white animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto block">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Deployment Verification</h2>
                    <p className="text-slate-500 text-base mt-2">Confirm the mapped details before our routing engine finalizes the node.</p>
                  </div>
                  
                  <div className="space-y-6 mb-12 bg-[#F8FAFC] p-8 rounded-[1.5rem] border-2 border-slate-100">
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Transcription Sequence</p>
                      <p className="text-lg font-medium text-slate-700 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                    </div>
                    {images.length > 0 && (
                      <div className="pt-6 border-t border-slate-200">
                         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ImagePlus className="w-4 h-4"/> Payload Attachments ({images.length})</p>
                         <div className="flex gap-4">
                           {images.map((img, i) => (
                              <img key={i} src={URL.createObjectURL(img)} alt="preview" className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                           ))}
                         </div>
                      </div>
                    )}
                    <div className="pt-6 border-t border-slate-200">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><MapPin className="w-4 h-4"/> Geospatial Target</p>
                      <div className="flex items-center justify-between text-slate-700 font-bold bg-white p-5 rounded-2xl border border-slate-200/60 font-mono text-lg shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><CheckCircle className="w-4 h-4"/></div>
                           [{coordinates.lat?.toFixed(5)}, {coordinates.lng?.toFixed(5)}]
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5">
                     <Button
                       onClick={executeFinalSubmit}
                       disabled={isSubmitting}
                       className="flex-1 py-5 font-black bg-blue-600 text-white rounded-[1.25rem] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center items-center text-lg"
                     >
                       {isSubmitting ? <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> Uploading Array...</> : 'Confirm & Deploy'}
                     </Button>
                     <Button
                       onClick={() => setStep('input')}
                       disabled={isSubmitting}
                       variant="outline"
                       className="w-full sm:w-auto px-8 py-5 font-bold border-2 border-slate-200 text-slate-600 rounded-[1.25rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                     >
                       <Edit3 className="w-5 h-5" /> Edit
                     </Button>
                  </div>
                </Card>
              )}
             </>
          )}

        </div>
      </div>
    </div>
  );
};

export default SubmitComplaintPage;
