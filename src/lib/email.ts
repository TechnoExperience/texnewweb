// Email service abstraction
// In a real implementation, this would use SendGrid, AWS SES, or similar

interface EmailOptions {
    to: string
    subject: string
    html: string
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
    // In development, we just log the email
    console.log("Sending email to:", to)
    console.log("Subject:", subject)
    console.log("Body:", html)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return { success: true }
}

export const notifyEventChange = async (event: any, action: "created" | "updated") => {
    const subject = `Event ${action}: ${event.title}`
    const html = `
    <h1>Event ${action}</h1>
    <p>The event <strong>${event.title}</strong> has been ${action}.</p>
    <p>Date: ${event.event_date}</p>
    <p>Venue: ${event.venue}</p>
    <br/>
    <a href="${import.meta.env.VITE_APP_URL}/events/${event.slug}">View Event</a>
  `

    // In a real app, this would go to a list of subscribers or admins
    // For now, we mock sending to an admin
    return sendEmail({
        to: "admin@technoexperience.com",
        subject,
        html,
    })
}
