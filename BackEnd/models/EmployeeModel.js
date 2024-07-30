const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    nip: {
        type: String,
        required: true,
        unique: true,
        length: 20
    },
    nama: {
        type: String,
        required: true,
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
        type: Date
    },
    umur: {
        type: Number
    },
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
        required: true,
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
        type: Buffer
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

employeeSchema.pre('save', function (next) {
    if (this.tanggal_lahir) {
        const today = new Date();
        const birthDate = new Date(this.tanggal_lahir);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        this.umur = age;
    }
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
