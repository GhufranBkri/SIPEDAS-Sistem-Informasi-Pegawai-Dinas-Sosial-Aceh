const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    nip: {
        type: String,
        unique: true,
        required: [true, 'NIP is required']
    },
    nama: {
        type: String,
        maxlength: 100
    },
    bidang: {
        type: String,
        maxlength: 50
    },
    eselon: {
        type: String,
        maxlength: 10
    },
    sub_bidang: {
        type: String,
        maxlength: 50
    },
    jabatan_terakhir: {
        type: String,
        maxlength: 50
    },
    gol_ruang: {
        type: String,
        maxlength: 10
    },
    jenjang: {
        type: String,
        maxlength: 50
    },
    jenis: {
        type: String,
        maxlength: 50
    },
    jenis_kelamin: {
        type: String,
        maxlength: 10
    },
    tempat_lahir: {
        type: String,
        maxlength: 50
    },
    tanggal_lahir: {
        type: Date // Menggunakan tipe data Date
    },
    nik: {
        type: String,
        maxlength: 20
    },
    npwp: {
        type: String,
        maxlength: 20
    },
    no_rekening: {
        type: String,
        maxlength: 20
    },
    no_kk: {
        type: String,
        maxlength: 20
    },
    golongan_darah: {
        type: String,
        maxlength: 3
    },
    no_telepon: {
        type: String,
        maxlength: 15
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    email_gov: {
        type: String,
        maxlength: 100
    },
    pendidikan: {
        type: String,
        maxlength: 50
    },
    jurusan: {
        type: String,
        maxlength: 50
    },
    tahun_tamat: {
        type: Number
    },
    jalan: {
        type: String,
        maxlength: 255
    },
    desa: {
        type: String,
        maxlength: 100
    },
    kecamatan: {
        type: String,
        maxlength: 100
    },
    kabupaten: {
        type: String,
        maxlength: 100
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
        maxlength: 20
    },
    foto: {
        type: String
    },
    jenis_tekon: {
        type: String,
        maxlength: 50
    },
    Kelas_jabatan: {
        type: String,
        maxlength: 50
    }
});

// Virtual field to calculate age
employeeSchema.virtual('umur').get(function () {
    if (!this.tanggal_lahir) return null; // Return null if tanggal_lahir is not set

    const today = new Date();
    const birthDate = new Date(this.tanggal_lahir);
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
