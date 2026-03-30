const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://saquiba:saquiba123@cluster0.hrgeeif.mongodb.net/attendance?retryWrites=true&w=majority&appName=attendance";

const medicalCertificateSchema = new mongoose.Schema({
  employeeId: { type: String, ref: "Employee" },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
});

const MedicalCertificate = mongoose.model("MedicalCertificate", medicalCertificateSchema);

async function checkCerts() {
  await mongoose.connect(MONGO_URI, { family: 4 });
  const certs = await MedicalCertificate.find({});
  console.log(JSON.stringify(certs, null, 2));
  mongoose.connection.close();
}

checkCerts().catch(console.error);
