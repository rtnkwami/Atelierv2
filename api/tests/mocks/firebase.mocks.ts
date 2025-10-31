
export const mockDecodedIdToken = {
  aud: "fake-firebase-project-id",
  auth_time: 1730390400,
  email: "johndoe@example.com",
  email_verified: true,
  exp: 1730394000,
  firebase: {
    identities: {
      email: ["johndoe@example.com"],
      "google.com": ["123456789012345678901"]
    },
    sign_in_provider: "google.com",
  },
  iat: 1730390400,
  iss: "https://securetoken.google.com/fake-firebase-project-id",
  phone_number: "+15551234567",
  picture: "https://lh3.googleusercontent.com/a-/AFdZucEXAMPLE",
  sub: "1234567890abcdef1234567890abcdef",
  uid: "1234567890abcdef1234567890abcdef"
};
