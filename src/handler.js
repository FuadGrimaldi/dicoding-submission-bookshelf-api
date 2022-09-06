const { nanoid } = require('nanoid');// import nanoid untuk mendapatkan id unik
const books = require('./books');// import array books

const addBooksHandler = (request, h) => { // fungsi untuk menambahkan buku
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload; // meminta/mengambil data dari request body (request body postman)

    if (name === undefined) { // jika nama buku kosong/undefined/null/!
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }
    if (readPage > pageCount) { // jika readPage lebih besar dari pageCount
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }
    const id = nanoid(16); // mendapatkan id 16 karakter unik
    const insertedAt = new Date().toISOString(); 
    const updatedAt = insertedAt; // nilai updatedAt sama dengan nilai insertedAt karena baru
    const finished = pageCount === readPage ? true : false; //

    const newBook = { // properti dari objek books yang perlu disimpan 
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
    };
    books.push(newBook); // method push berfungsi memasukan nilai dari properti ke dalam array books
    /**
     * method filter mengembalikan array dengan berdasarkan id catatan
     */
    const isSuccess = books.filter((book) => book.id === id).length > 0;
    if (isSuccess) { // isSuccess menentukan response yang diberikan server
        const response = h.response({ // jika true
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }
    const response = h.response({ // false
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};
const getAllBooksHandler = (request, h) => { // fungsi untuk menampilakan buku
    const { name, reading, finished } = request.query; // menambahkan fitur query
    /**
     * Menampilakan seluruh buku yang mengandung nama berdasarkan value yang diberikan pada query
     */
    if (name) {
        /**
         * menggunakan method includes() agar dapat menemukan string 
         * b.name yang mengandung string name
         */
        const getBooks = books.filter((b) => b.name.toLowerCase().includes(name.toLowerCase()));
        const response = h.response({ // true
            status: 'success',
            data: {
                // gunakan map untuk mendapatkan data id, name, publisher
                books: getBooks.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        });
        response.code(200);
        return response;
    }
    /**
     * Bernilai 0 atau 1, jika 0 tampilkan buku yang sedang tidak dibaca (reading: false)
     * jika 1 tampilkan buku yang sedang dibaca (reading: true)
     */
    if (reading) {
        /**
         * Tipe data b.reading dan reading harus sama.
         */
        const getBooks = books.filter((b) => Number(b.reading) === Number(reading));
        const response = h.response({
            status: 'success',
            data: {
                books: getBooks.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        });
        response.code(200);
        return response;
    }
    /**
     * Bernilai 0 dan 1, jika 0 tampilkan buku belum selesai dibaca (finished: false)
     * jika 1 tampilakn buku yang sudah selesai dibaca (finished: true)
     */
    if (finished) {
        /**
         * Tipe data b.finished dan finished harus sama.
         */
        const getBooks = books.filter((b) => Number(b.finished) === Number(finished));
        const response = h.response({
            status: 'success',
            data: {
                books: getBooks.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        });
        response.code(200);
        return response;
    }
    /**
     * menampilkan seluruh buku tanpa query
     */
    if (!name && !reading && !finished) {
        const response = h.response({
            status: 'success',
            data: {
                books: books.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        });
        response.code(200);
        return response;
    }
};

const getSpecificBooksHandler = (request, h) => { // fungsi untuk menampilkan buku berdasarkan Id
    /**
     * mengembalikan objek catatan secara spesifik berdasarkan id yang digunakan oleh path parameter
     */
    const { bookId } = request.params;
    /**
     * method filter mengembalikan array dengan berdasarkan id catatan
     */
    const book = books.filter((b) => b.id === bookId)[0]; //
    if (book !== undefined) { // objek book tidak bernilai undefined
        const response = h.response({ // true
            status: 'success',
            data: {
                book, // menampilkan seluruh properti yang ada dalam objek book
            },
        });
        response.code(200);
        return response;
    }
    const response = h.response({ // false
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
};
const editBookByIdHandler = (request, h) => { // fungsi untuk mengedit/mengubah buku
    /**
     * mengembalikan objek catatan secara spesifik berdasarkan id yang digunakan oleh path parameter
     */
    const { bookId } = request.params;
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload; // meminta/mengambil data dari request body (request body postman)
    /**
     * perbarui nilai dari properti updatedAt dengan menggunakan new Date().toISOString()
     */
    const updatedAt = new Date().toISOString();
    /**
     * dapatkan index array pada objek catatan sesuai id yang ditentukan
     * dengan method array findIndex()
     */
    const index = books.findIndex((book) => book.id === bookId);

    if (name === undefined) { // jika nama kosong/undefined
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }
    if (readPage > pageCount) { // jika readPage lebih besar dari pageCount
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }
    /**
     * jika index tidak sama dengan -1 hasilnya objek ditemukan
     * jika index sama dengan -1 hasilnya objek tidak ditemukan
     */
    if (index !== -1) {
        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt,
        };
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        });
        response.code(200);
        return response;
    }
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};
const deleteBookByIdHandler = (request, h) => { // fungsi untuk menghapus buku
    /**
     * mengembalikan objek catatan secara spesifik berdasarkan id yang digunakan oleh path parameter
     */
    const { bookId } = request.params;
    /**
     * dapatkan index array pada objek catatan sesuai id yang ditentukan
     * dengan method array findIndex()
     */
    const index = books.findIndex((book) => book.id === bookId);
    if (index !== -1) { // jika index tidak sama dengan -1
        /**
         * method spilece() untuk menghapus data pada array berdasarkan index
         */
        books.splice(index, 1);
        const response = h.response({ // true
            status: 'success',
            message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }
    const response = h.response({ // false
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};
// exports fungsi-fungsi
module.exports = {
    addBooksHandler,
    getAllBooksHandler,
    getSpecificBooksHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
};
