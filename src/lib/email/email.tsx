import { Resend } from "resend";
import { EmailBody } from "./emailData";

// const emailURL = "https://api.resend.com/emails";

// export async function sendMail(
//   name: string,
//   email: string,
//   url: string,
//   apiKey: string,
// ) {
//   try {
//     const html = EmailBody(name, url);
//     let count = 0;
//     while (count < 3) {
//       const res = await fetch(emailURL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${apiKey}`,
//         },
//         body: JSON.stringify({
//           from: "Rent A Ride <rent-a-ride@joeljm.dpdns.org>",
//           to: [email],
//           subject: "Registration Verification",
//           html: html,
//         }),
//       });
//       if (res.ok) {
//         console.log("Email sent");
//         const json = await res.json();
//         return json;
//       }
//       console.log("Could not send email");
//       count++;
//     }
//   } catch (err) {
//     console.log(`Error ${err}`);
//     return null;
//   }
//   console.log("Could not send the email 3 times");
//   return null;
// }

interface mailArgs {
  name: string;
  email: string;
  url: string;
  apiKey: string;
}

//TODO: Remove hardcoded url
export async function sendMail({ name, email, url, apiKey }: mailArgs) {
  const emailText = `Welcome to rent-a-ride
  Click the link below to complete registration
  ${url}`;
  const resend = new Resend(apiKey);
  const data = await resend.emails.send({
    from: "Rent A Ride <rent-a-ride@joeljm.dpdns.org>",
    to: email,
    subject: "Registration Verification",
    text: emailText,
    react: <EmailBody name={name} url={url} />,
  });
  return data;
}

async function sendVerificationMail({ name, email, url, apiKey }: mailArgs) {
  const { error } = await sendMail({ name, email, url, apiKey });
  return error;
}

export default async function sendMailThrice(
  name: string,
  email: string,
  url: string,
  apiKey: string,
) {
  let count = 0;
  let error: Awaited<ReturnType<typeof sendVerificationMail>> = null;
  while (count < 3) {
    error = await sendVerificationMail({ name, email, url, apiKey });
    if (error === null) {
      return null;
    }
    count++;
    await new Promise((res) => setTimeout(res, 1000));
  }
  return error;
}
