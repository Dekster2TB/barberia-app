const nodemailer = require('nodemailer');

// Configuración de transporte para Gmail
// Si no tienes una contraseña de aplicación, el correo fallará pero el servidor no se caerá
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tucorreo@gmail.com', // ⚠️ REEMPLAZAR CON TU CORREO REAL
        pass: 'xxxx xxxx xxxx xxxx' // ⚠️ REEMPLAZAR CON TU CONTRASEÑA DE APLICACIÓN
    }
});

// Función reutilizable para enviar correos
const sendConfirmationEmail = async (email, booking) => {
    // Si no hay email o transporte configurado, salimos sin romper nada
    if (!email) return;

    const mailOptions = {
        from: '"Barbería del Futuro 💈" <no-reply@barberia.com>',
        to: email,
        subject: '¡Tu Reserva está Confirmada! ✅',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Reserva Confirmada</h2>
                <p>Hola <strong>${booking.user_name}</strong>,</p>
                <p>Tu cita ha sido agendada con éxito:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p>📅 <strong>Fecha:</strong> ${booking.date}</p>
                    <p>⏰ <strong>Hora:</strong> ${booking.start_time}</p>
                    <p>✂️ <strong>Servicio:</strong> ${booking.serviceName}</p>
                    <p>💈 <strong>Barbero:</strong> ${booking.barberName}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Correo enviado a ${email}`);
    } catch (error) {
        console.error('❌ Error enviando correo (Revisa tus credenciales en mailer.js):', error.message);
        // No lanzamos el error para que la reserva se guarde igual aunque falle el correo
    }
};

module.exports = { sendConfirmationEmail };