const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    nip: {
        type: String,
        unique: true,
        length: 20
    },
    nama: {
        type: String,
        length: 100
    },
    bidang: {
        type: String,
        length: 50
    },
    eselon: {
        type: String,
        length: 10
    },
    sub_bidang: {
        type: String,
        length: 50
    },
    jabatan_terakhir: {
        type: String,
        length: 50
    },
    gol_ruang: {
        type: String,
        length: 10
    },
    jenjang: {
        type: String,
        length: 50
    },
    jenis: {
        type: String,
        length: 50
    },
    jenis_kelamin: {
        type: String,
        length: 10
    },
    tempat_lahir: {
        type: String,
        length: 50
    },
    tanggal_lahir: {
        type: String
    },
    // Remove the umur field from here as it's now virtual
    nik: {
        type: String,
        length: 20
    },
    npwp: {
        type: String,
        length: 20
    },
    no_rekening: {
        type: String,
        length: 20
    },
    no_kk: {
        type: String,
        length: 20
    },
    golongan_darah: {
        type: String,
        length: 3
    },
    no_telepon: {
        type: String,
        length: 15
    },
    email: {
        type: String,
        length: 100
    },
    email_gov: {
        type: String,
        length: 100
    },
    pendidikan: {
        type: String,
        length: 50
    },
    jurusan: {
        type: String,
        length: 50
    },
    tahun_tamat: {
        type: Number
    },
    jalan: {
        type: String,
        length: 255
    },
    desa: {
        type: String,
        length: 100
    },
    kecamatan: {
        type: String,
        length: 100
    },
    kabupaten: {
        type: String,
        length: 100
    },
    alamat_lengkap: {
        type: String
    },
    tahun_sk_awal: {
        type: Number
    },
    tahun_sk_akhir: {
        type: Number
    },
    masa_kerja: {
        type: Number
    },
    no_req_bkn: {
        type: String,
        length: 20
    },
    foto: {
        type: String
    },
    jenis_tekon: {
        type: String,
        length: 50
    },
    Kelas_jabatan: {
        type: String,
        length: 50
    }
});

// Virtual field to calculate age
employeeSchema.virtual('umur').get(function () {
    if (!this.tanggal_lahir) return null; // Return null if tanggal_lahir is not set

    // Change the split order to match DD/MM/YYYY
    const [day, month, year] = this.tanggal_lahir.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Ensure virtual fields are included in JSON output
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
