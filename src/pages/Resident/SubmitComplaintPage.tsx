import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ImagePlus, CheckCircle, Clock, FileText, Mic, MicOff, Globe, AlertCircle, Edit3 } from 'lucide-react';
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
  
  // Form Payload
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Web Speech Specific Maps
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const recognitionRef = useRef<any>(null);
  const supportsSpeech = !!SpeechRecognition;

  useEffect(() => {
    if (supportsSpeech) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false; 

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setFormData(prev => ({
            ...prev,
            description: prev.description + (prev.description ? ' ' : '') + finalTranscript.trim()
          }));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title block requires population';
    if (!formData.description.trim()) newErrors.description = 'Provide a robust detail log';
    if (!formData.location.trim()) newErrors.location = 'Specific coordinate/location is mandatory';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const proceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) toggleListening(); // Safe clamp
    if (validateForm()) {
        setStep('confirm');
    }
  };

  const executeFinalSubmit = async () => {
    setApiError('');
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        locationText: formData.location, 
        // Completely stripped explicit AI properties forcing Express natively handles Classification, SLA, and Routing.
      };

      const result = await createComplaint(payload).unwrap();
      
      console.log('[Native Verification Log] Output Network Dump:', result);
      
      setSuccessPayload(result.data || result);
      // Formalized required toast alert
      showSuccess("Complaint submitted and routed to the appropriate department");

      setTimeout(() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS), 4000);
      
    } catch (error: any) {
      const msg = error?.data?.message || 'Express Native validation engine rejected query map.';
      setApiError(msg);
      showError("Failed to submit complaint");
      setStep('input'); // Fallback visually on Exception
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Navigation */}
      <nav className="flex items-center justify-between px-10 py-6 bg-white shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-xl">R</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Resident Portal</span>
        </div>
        <button onClick={() => navigate(ROUTES.RESIDENT_DASHBOARD)} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
            Back to Hub
        </button>
      </nav>

      {/* Main Context Matrix */}
      <div className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-2xl">
          
          {/* Phase 3: Success Lock */}
          {successPayload && (
            <Card variant="lg" className="p-10 border-l-8 border-green-500 bg-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
               <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
               <h2 className="text-3xl font-black text-slate-900 text-center tracking-tight mb-2">Complaint Logged Securely</h2>
               <p className="text-slate-600 text-center font-medium mb-8">Node AI has structurally routed your ticket organically. Returning to hub timeline...</p>
               
               <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Ticket Reference Map</p>
                 <p className="text-lg font-mono font-bold text-slate-700">{successPayload._id || 'COMP-XXXXX'}</p>
                 
                 <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">State Log</p>
                      <span className="bg-blue-100 text-blue-800 font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider">{successPayload.status || 'PENDING'}</span>
                    </div>
                 </div>
                 
                 {/* TASK 8 Option Layout: If backend mapped translations, render natively securely */}
                 {successPayload.translatedText && (
                   <div className="mt-6 pt-4 border-t border-slate-200">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Machine Processed Context Constraint:</p>
                     <p className="text-sm font-medium italic text-slate-600">"We understood: {successPayload.translatedText}"</p>
                   </div>
                 )}
               </div>
            </Card>
          )}

          {/* Phase 1 & 2 Rendering Nodes */}
          {!successPayload && (
             <>
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Lodge Complaint Flow</h1>
                <p className="text-slate-500 font-medium max-w-md mx-auto">Digitally map functional issues through the Web Speech subsystem bypassing manual inputs.</p>
              </div>

              {apiError && (
                 <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg text-red-800 font-medium shadow-sm">
                   <h3 className="font-bold flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4"/> Validation Blocked</h3>
                   {apiError}
                 </div>
              )}

              {/* State Machine Step 1: Input Matrix */}
              {step === 'input' && (
                <Card variant="lg" className="p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative">
                  <form onSubmit={proceedToConfirmation} className="space-y-8">
                    
                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wide mb-2">Subject Node</label>
                      <input
                        name="title"
                        type="text"
                        placeholder="Identifiable header block..."
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.title ? 'border-red-400 focus:ring-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:bg-white'}`}
                      />
                      {errors.title && <p className="text-red-500 text-xs font-bold mt-2">■ {errors.title}</p>}
                    </div>

                    {/* Microphone Web Speech Wrapper */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-wide">Digital Description Matrix</label>
                        {supportsSpeech && (
                          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                             <button
                               type="button"
                               onClick={() => {
                                 if(isListening) toggleListening();
                                 setLang('en-US');
                               }}
                               className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en-US' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                             >
                               [ English ]
                             </button>
                             <button
                               type="button"
                               onClick={() => {
                                 if(isListening) toggleListening();
                                 setLang('ur-PK');
                               }}
                               className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'ur-PK' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                             >
                               [ اردو ]
                             </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative">
                        <textarea
                          name="description"
                          placeholder={supportsSpeech ? "Type inherently or rely on the Mic Node directly..." : "Elaborate your constraints..."}
                          value={formData.description}
                          onChange={handleChange}
                          rows={6}
                          className={`w-full pl-5 pr-14 py-4 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.description ? 'border-red-400 focus:ring-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:bg-white'}`}
                        />
                        
                        {supportsSpeech && (
                          <button
                            type="button"
                            onClick={toggleListening}
                            className={`absolute right-4 bottom-4 p-3 rounded-full shadow-md transition-all flex items-center justify-center
                              ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}
                            `}
                          >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </button>
                        )}
                      </div>

                      {/* Explicit Indicator Constraints */}
                      {supportsSpeech && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-bold">
                          {isListening ? (
                            <span className="text-red-600 flex items-center gap-1.5 animate-pulse"><span className="w-2 h-2 rounded-full bg-red-600"></span> 🎤 Listening... [{lang === 'en-US' ? 'English' : 'Urdu'}]</span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> 🎤 Recording stopped</span>
                          )}
                        </div>
                      )}

                      {errors.description && <p className="text-red-500 text-xs font-bold mt-2">■ {errors.description}</p>}
                    </div>

                    {/* Location Node */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wide mb-2">Geospatial Tag</label>
                      <input
                        name="location"
                        type="text"
                        placeholder="Sector, block, radius..."
                        value={formData.location}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.location ? 'border-red-400 focus:ring-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:bg-white'}`}
                      />
                      {errors.location && <p className="text-red-500 text-xs font-bold mt-2">■ {errors.location}</p>}
                    </div>
                    
                    {/* Routing */}
                    <div className="pt-6 border-t border-slate-100">
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        className="py-4 font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200"
                      >
                        Review Complaint Map <Send className="w-4 h-4 ml-2 inline-block"/>
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* State Machine Step 2: Confirmation Matrix */}
              {step === 'confirm' && (
                <Card variant="lg" className="p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Is this mapping correct?</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Our Backend AI will parse the textual context natively.</p>
                  </div>
                  
                  <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Log Subject Output</p>
                      <p className="text-lg font-bold text-slate-800">{formData.title}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Detected Transcription Value</p>
                      <p className="text-base font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Coordinates</p>
                      <p className="text-base font-medium text-slate-700">{formData.location}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                     <Button
                       onClick={executeFinalSubmit}
                       isLoading={isSubmitting}
                       variant="primary"
                       className="flex-1 py-4 font-black bg-blue-600 shadow-xl shadow-blue-200"
                     >
                       Yes, Finalize & Submit ✔
                     </Button>
                     <Button
                       onClick={() => setStep('input')}
                       disabled={isSubmitting}
                       variant="outline"
                       className="flex-1 py-4 font-bold border-2 border-slate-300 text-slate-600"
                     >
                       <Edit3 className="w-5 h-5 mr-2" /> Edit / Re-record
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
