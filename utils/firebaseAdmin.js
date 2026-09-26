// utils/firebaseAdmin.js
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = {
  type: "service_account",
  project_id: "timely-f4f1e",
  private_key_id: "99c655d07ceb82c83e13ef92f7670d99f4b6579f",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgLe/4rXQVtuzu
N1csFiAqrsl7uX1HLvLQpmvD4U76d81RCQOyvYDFx3SoAlAEMlIJhD5LxXzb5Hrd
69tfwjkTJH1Jkme7my4nwGn15G+/O86uN7XTEwvznnOGrdwQ6G55swnH62HU5Q1x
6r/oVeEj818/hhgtyWDKVDhS7h5aPVbrcl5s2yho0Zwg8SovoGbwkboUgFSfGZ44
L3j4S9cdCTdfhb2xniQffgq5Vfn6ismZsD47JXIm7kzRleMfgp434S0q5EzHK5Gy
NROk9pXNbVfTQdosjWNXg1h3jgplM1S+RQf9n55/EkQ0N3zKIxbQEbLF3cSI9kzR
ZI8c8/qbAgMBAAECggEABd1dykkrYMgM0byT5LzdcZBqB/kVzG9vfcLkzdaOnOHW
drjAJoRrooDxzdVlp35zg/k4Mf5EInKLPlQFxK8NlDEfr/WLDi7kmbigbQThYYTc
htVBRfjZFrH9/rd8qtqRzVBAQMEpKYsme2TzSU452hlrU/ublVMP26sxYAYHuD+X
BXFx7WW1rjB/5KoSfN/gmxpObgLIY/TVFu+Voe0lrTelGcjwk+aJR7aZbAM0NlDO
bqd2WvhS2IecFfhknWo/qoncxghmXJMguwxngFtqjEnq+12S/FKQdsqGt/Bk+JKe
WAl0ty73k2r1Yhzs2Tkzq93cE9v+hqKE14K6rW79/QKBgQD03x7xQQVtS5VGqYOu
1Ie+DsfsfyQoKNrXPUWksajnsgvsdhTpZzl0IjJUXIqZQfwpd5XudOlSAdT846Jw
7eYcrBUJhHYm4Habb3mAdgfHfcGJn4kAzEmNYTy047z7+NpVnOmUyJ767i34SKAd
SbRk6mu5pIkvLC2uHqURrJks7wKBgQDqXhSosljRTW/8AKcrVMVFN6hG7cwZibKQ
XZWbAxq+r9miMl/6KmxGiTi6rQhDwD57LwjEBqMuILNjQPkbeHtFeowcf6g/Sdp4
ED6ENnxLtHavBxGQc4Tk6kHvIsTAVik6dazdDOJdLmnjY6s81qdzP9RrGWfv0+4Z
8/znpudlFQKBgQCG2ZTVsUQG03fqiRGupvX2EXfB4qaLwyv5GpIOx5PHvMJaPxD3
FFSMgwSKdsgQ7EisoWGdBx8yfTXI6qcbX7e4lH+lVSAn+rb2lGYp+1X/Y17Apm2x
Vc8vn5vp1fzOGlZKjXYI7I64i5AfSgd6+YrxhDM88cJmiwLA/7lRyWY1WwKBgHiD
0FO/AfT+wOrw2wVpHdet+xYeCanIKM4bkWaYfhQ4EM1a4ged8PeEcGtttqZAIODv
Gq7SSu7ZWeVb77y0g48CqTGuYzHIJFNA5yTNb7TuI2l1VQ7WmCuuWiFB27Kbm6+3
+x/gFDaeO0z2X4N1Tb3xwKUh91RXwkQONqpYJPzRAoGARJ23TxFR+hItcB77ZvXf
dXyZqsNX1dS7rPk5SHTvCHlRJPb4yPdWFnFT+fJB7DFYM9+52Fkf5UsdOYLOOFqM
QvfhhkOK1bnB9rjxEOw3yI3SIUXmOdTxCnrrT3m+/iXR56/hS3No9ahHuWrefouT
x9h4YVo6BsC7YCQVk037VGU=
-----END PRIVATE KEY-----
`,
  client_email: "firebase-adminsdk-fbsvc@timely-f4f1e.iam.gserviceaccount.com",
  client_id: "112834683363224934833",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40timely-f4f1e.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// ✅ Modular API — v13+ ke liye sahi tarika
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = { getMessaging };