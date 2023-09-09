const fs = require("fs/promises");

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = [];
        this.nextId = 1;
    }

    async initialize() {
        try {
            const data = await fs.readFile(this.path, "utf-8");
            this.products = JSON.parse(data);
            if (this.products.length > 0) {
                this.nextId = Math.max(...this.products.map((product) => product.id)) + 1;
            }
        } catch (error) {
            console.error("Error al leer el archivo de productos:", error);
        }
    }

    async saveToFile() {
        try {
            const data = JSON.stringify(this.products, null, 2);
            await fs.writeFile(this.path, data);
        } catch (error) {
            console.error("Error al guardar en el archivo de productos:", error);
        }
    }

    addProduct(product) {
        if (
            !product.title ||
            !product.description ||
            !product.price ||
            !product.thumbnail ||
            !product.code ||
            !product.stock
        ) {
            console.error("Todos los campos son obligatorios");
            return;
        }

        if (
            this.products.some(
                (existingProduct) => existingProduct.code === product.code
            )
        ) {
            console.error("Ya existe un producto con el mismo código");
            return;
        }

        product.id = this.nextId++;
        this.products.push(product);
        this.saveToFile();
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find((p) => p.id === id);
        if (!product) {
            console.error("Producto no encontrado");
            return null;
        }
        return product;
    }

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex((p) => p.id === id);
        if (index === -1) {
            console.error("Producto no encontrado");
            return;
        }
        updatedProduct.id = id;
        this.products[index] = updatedProduct;
        this.saveToFile();
    }

    deleteProduct(id) {
        const index = this.products.findIndex((p) => p.id === id);
        if (index === -1) {
            console.error("Producto no encontrado");
            return;
        }

        this.products.splice(index, 1);
        this.saveToFile();
    }
}

//Testeo

(async () => {
    const productManager = new ProductManager("productos.json");
    await productManager.initialize();

    // Testeo 1
    const emptyProducts = productManager.getProducts();
    console.log("Productos iniciales:", emptyProducts);
    console.assert(
        emptyProducts.length === 0,
        "La lista de productos no está vacía al inicio"
    );

    // Testeo 2
    productManager.addProduct({
        title: "producto prueba",
        description: "Este es un producto prueba",
        price: 200,
        thumbnail: "Sin imagen",
        code: "abc123",
        stock: 25,
    });

    const productsAfterAdd = productManager.getProducts();
    console.log("Productos después de agregar uno:", productsAfterAdd);
    console.assert(
        productsAfterAdd.length === 1,
        "La lista de productos no contiene un producto después de agregarlo."
    );

    // Testeo 3 (Producto repetido)
    productManager.addProduct({
        title: "producto repetido",
        description: "Este producto tiene un código repetido",
        price: 300,
        thumbnail: "Sin imagen",
        code: "abc123",
        stock: 15,
    });

    // Testeo 4 (Producto no existente)
    const nonExistentProduct = productManager.getProductById(99);
    console.log("Resultado de la prueba:", nonExistentProduct);

    // Testeo 5 (Producto existente)
    const existingProduct = productManager.getProductById(1);
    console.log("Resultado de la prueba:", existingProduct);

    // Testeo 6 (Update Product)
    productManager.updateProduct(1, {
        title: "Producto Actualizado",
        description: "Este producto ha sido actualizado",
        price: 250,
        thumbnail: "Nueva imagen",
        code: "xyz789",
        stock: 30,
    });

    const updatedProduct = productManager.getProductById(1);
    console.log("Producto actualizado:", updatedProduct);

    // Testeo 7 (Delete Product)
    productManager.deleteProduct(1);
    const deletedProduct = productManager.getProductById(1);
    console.log("Producto eliminado:", deletedProduct);
})();