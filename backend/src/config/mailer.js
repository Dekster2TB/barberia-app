const { Resend } = require('resend');

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const sendConfirmationEmail = async (clientEmail, booking) => {
    if (!clientEmail) return;

    // --- CONFIGURACIÓN INTELIGENTE (MODO PRUEBA VS PRODUCCIÓN) ---
    
    // 1. ¿DESDE QUIÉN SE ENVÍA?
    // Mientras NO tengas dominio, usa 'onboarding@resend.dev'
    // Cuando compres el dominio (ej: barberia-top.com), cámbialo a: 'Reservas <hola@barberia-top.com>'
    const fromEmail = 'Confirmación Cita <onboarding@resend.dev>';

    // 2. ¿A QUIÉN SE ENVÍA? (Lógica de seguridad para pruebas)
    // En modo prueba (sin dominio), Resend SOLO permite enviar al correo del dueño de la cuenta (TÚ).
    // Si intentas enviar a otro, fallará.
    // Para evitar errores en demos, podrías forzar que siempre llegue a tu correo de pruebas si detecta que no es producción,
    // pero lo dejaremos directo para que veas si funciona.
    
    // IMPORTANTE: En tus pruebas, ingresa SIEMPRE tu propio correo en el formulario de reserva.
    const toEmail = clientEmail; 

    try {
        const data = await resend.emails.send({
            from: fromEmail,
            to: [toEmail], 
            subject: '¡Tu Reserva está Confirmada! 💈',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                        <h2 style="color: #fbbf24; margin: 0; letter-spacing: 2px;">${booking.appName || 'BARBERÍA'}</h2>
                    </div>
                    
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #333;">Hola <strong>${booking.user_name}</strong>,</p>
                        <p style="color: #555;">Tu cita ha sido agendada con éxito. Te esperamos para darte el mejor estilo.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #fbbf24;">
                            <p style="margin: 8px 0; font-size: 15px;">📅 <strong>Fecha:</strong> ${booking.date}</p>
                            <p style="margin: 8px 0; font-size: 15px;">⏰ <strong>Hora:</strong> ${booking.start_time}</p>
                            <p style="margin: 8px 0; font-size: 15px;">✂️ <strong>Servicio:</strong> ${booking.serviceName}</p>
                            <p style="margin: 8px 0; font-size: 15px;">💈 <strong>Barbero:</strong> ${booking.barberName}</p>
                        </div>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://tu-sitio-en-render.com/my-bookings" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold;">Ver mis Citas</a>
                        </div>
                    </div>

                    <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                        <p>Si necesitas reagendar, contáctanos por WhatsApp.</p>
                        <p>© ${new Date().getFullYear()} ${booking.appName || 'Barber App'}.</p>
                    </div>
                </div>
            `
        });

        if (data.error) {
            console.error('⚠️ Error de Resend:', data.error);
        } else {
            console.log('✅ Correo enviado con éxito. ID:', data.id);
        }

    } catch (error) {
        console.error('❌ Falló el envío de correo. ¿Estás enviando a tu propio email registrado?', error.message);
    }
};

module.exports = { sendConfirmationEmail };