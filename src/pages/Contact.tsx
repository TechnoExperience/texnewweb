import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Instagram, Facebook, Twitter, CheckCircle } from 'lucide-react';
import useSupabase from '../hooks/useSupabase';

const Contact: React.FC = () => {
  const { createContactMessage, subscribeNewsletter } = useSupabase();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const result = await createContactMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || `${formData.type} - ${formData.name}`,
        message: formData.message
      });

      if (result) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          type: 'general'
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('idle');

    try {
      const result = await subscribeNewsletter(newsletterEmail);
      
      if (result) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setNewsletterStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-section">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-category-videos brutal-border border-category-videos flex items-center justify-center">
              <Mail className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-bebas text-4xl md:text-6xl tracking-wider text-white">
              CONTACTO
            </h1>
          </div>
          <p className="text-gray-light font-space text-lg max-w-3xl">
            Conecta con nosotros. Ya sea para colaboraciones, propuestas de eventos, 
            entrevistas o simplemente para compartir tu pasión por la cultura techno.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="font-bebas text-3xl tracking-wider text-white mb-6">
              ENVÍANOS UN MENSAJE
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-space text-sm text-gray-light mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block font-space text-sm text-gray-light mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-space text-sm text-gray-light mb-2">
                  Tipo de consulta
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                >
                  <option value="general">Consulta General</option>
                  <option value="event">Propuesta de Evento</option>
                  <option value="interview">Solicitud de Entrevista</option>
                  <option value="collaboration">Colaboración</option>
                  <option value="press">Prensa</option>
                </select>
              </div>

              <div>
                <label className="block font-space text-sm text-gray-light mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                  placeholder="¿De qué quieres hablar?"
                />
              </div>

              <div>
                <label className="block font-space text-sm text-gray-light mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border resize-none"
                  placeholder="Cuéntanos más detalles..."
                />
              </div>

              {submitStatus === 'success' && (
                <div className="flex items-center space-x-2 text-neon-mint mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-space text-sm">¡Mensaje enviado exitosamente!</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="text-red-500 mb-4 font-space text-sm">
                  Error al enviar el mensaje. Por favor, inténtalo de nuevo.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-4 bg-neon-mint text-black font-bebas text-lg tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-2 w-5 h-5" />
                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
              </button>
            </form>
          </div>

          {/* Contact Info & Social */}
          <div>
            <h2 className="font-bebas text-3xl tracking-wider text-white mb-6">
              INFORMACIÓN DE CONTACTO
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-neon-pink brutal-border border-neon-pink flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bebas text-lg tracking-wider text-white mb-1">
                    EMAIL PRINCIPAL
                  </h4>
                  <p className="text-gray-light font-space text-sm">
                    hello@technoexperience.net
                  </p>
                  <p className="text-gray-light font-space text-xs mt-1">
                    Respuesta en 24-48 horas
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-neon-yellow brutal-border border-neon-yellow flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-bebas text-lg tracking-wider text-white mb-1">
                    UBICACIÓN
                  </h4>
                  <p className="text-gray-light font-space text-sm">
                    Barcelona, España
                  </p>
                  <p className="text-gray-light font-space text-xs mt-1">
                    Oficinas virtuales · Equipo distribuido
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-bebas text-lg tracking-wider text-white mb-1">
                    PRENSA
                  </h4>
                  <p className="text-gray-light font-space text-sm">
                    press@technoexperience.net
                  </p>
                  <p className="text-gray-light font-space text-xs mt-1">
                    Para solicitudes de prensa y medios
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-bebas text-xl tracking-wider text-white mb-4">
                SÍGUENOS
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-12 h-12 bg-transparent border-2 border-gray-dark hover:border-neon-mint hover:text-neon-mint flex items-center justify-center transition-all duration-300 brutal-border"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-transparent border-2 border-gray-dark hover:border-neon-pink hover:text-neon-pink flex items-center justify-center transition-all duration-300 brutal-border"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-transparent border-2 border-gray-dark hover:border-neon-yellow hover:text-neon-yellow flex items-center justify-center transition-all duration-300 brutal-border"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
              
              <div className="mt-6 p-4 bg-gray-dark bg-opacity-30 brutal-border border-gray-dark">
                <h4 className="font-bebas text-lg tracking-wider text-neon-mint mb-2">
                  COLABORACIONES
                </h4>
                <p className="text-gray-light font-space text-sm leading-relaxed">
                  ¿Eres artista, promotor, label o venue? Nos encanta descubrir 
                  nuevos talentos y proyectos. Contáctanos para explorar 
                  oportunidades de colaboración.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
