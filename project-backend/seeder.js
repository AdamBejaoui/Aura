const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
    // New Arrivals
    {
        name: "Aura Signature Overcoat",
        category: "New Arrivals",
        price: 850,
        description: "Tailored from premium Italian wool, this overcoat defines modern luxury with its sharp silhouette and minimal detailing.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.9,
        numReviews: 12
    },
    {
        name: "Nomad Technical Parka",
        category: "New Arrivals",
        price: 420,
        description: "A high-performance parka featuring water-resistant fabric and multiple utility pockets, perfect for the modern explorer.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.7,
        numReviews: 8
    },
    // Wardrobe Staples
    {
        name: "Essential Cashmere Crewneck",
        category: "Wardrobe Staples",
        price: 280,
        description: "Our signature 100% cashmere sweater. Soft, breathable, and designed to last a lifetime.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 5.0,
        numReviews: 45
    },
    {
        name: "Premium Raw Denim",
        category: "Wardrobe Staples",
        price: 195,
        description: "14oz Japanese selvedge denim in a slim-straight cut. Develops a unique character with every wear.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.8,
        numReviews: 22
    },
    {
        name: "Classic Oxford Shirt",
        category: "Wardrobe Staples",
        price: 120,
        description: "The perfect button-down. Crafted from heavy-duty cotton with a refined texture.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.6,
        numReviews: 31
    },
    // Statement Pieces
    {
        name: "Velvet Sculpted Blazer",
        category: "Statement Pieces",
        price: 650,
        description: "A bold take on evening wear. This deep emerald velvet blazer features structured shoulders and a slim waist.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1594932224010-3a13def2703a?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.9,
        numReviews: 14
    },
    {
        name: "Asymmetric Silk Wrap",
        category: "Statement Pieces",
        price: 340,
        description: "Ethereal silk wrap top with an asymmetric hem and dramatic sleeves. A true conversation starter.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.8,
        numReviews: 9
    },
    // Streetwear
    {
        name: "Heavyweight Graphic Hoodie",
        category: "Streetwear",
        price: 145,
        description: "480GSM organic cotton hoodie featuring a modular Aura graphic on the back.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.7,
        numReviews: 56
    },
    {
        name: "Cargo Combat Trousers",
        category: "Streetwear",
        price: 210,
        description: "Modern street utility. Features adjustable ankle straps and reinforced knee panels.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1624371414361-e6e0ef58d2a2?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.5,
        numReviews: 18
    },
    {
        name: "Aura Tech Sneakers",
        category: "Streetwear",
        price: 320,
        description: "Futuristic design meets ultimate comfort. Features a breathable mesh upper and responsive carbon plate.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.9,
        numReviews: 27
    },
    // Evening Luxe
    {
        name: "Midnight Silk Gown",
        category: "Evening Luxe",
        price: 1200,
        description: "Pure silk satin gown that drapes elegantly to the floor. Features a low back and delicate straps.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 5.0,
        numReviews: 15
    },
    {
        name: "Structured Tuxedo Shirt",
        category: "Evening Luxe",
        price: 240,
        description: "The foundation of formal elegance. Marcella bib front and double cuffs.",
        currency: "TND",
        images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop"],
        inStock: true,
        rating: 4.8,
        numReviews: 7
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aura');
        console.log("Connected to MongoDB...");

        // Clear existing products
        await Product.deleteMany({});
        console.log("Cleared existing products.");

        await Product.insertMany(products);
        console.log(`Successfully seeded ${products.length} products!`);

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();
