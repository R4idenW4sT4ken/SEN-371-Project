import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const round2 = (value) => Math.round(value * 100) / 100;

const orderNumber = () =>
  `SS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

const hashPassword = (password) => bcrypt.hash(password, 12);

async function seed() {
  await connectDB();

  if (process.argv.includes("--wipe")) {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log("All collections cleared (users, categories, products, carts, orders, reviews).");
  }

  let admin = await User.findOne({ email: "admin@shopsphere.com" });
  if (!admin) {
    admin = await User.create({
      name: "Admin User",
      email: "admin@shopsphere.com",
      password: await hashPassword("Admin@12345"),
      role: "admin",
    });
    console.log(`Admin user created (admin@shopsphere.com / Admin@12345)`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const customerSpecs = [
    { email: "testuser@example.com", password: "Password123", name: "Test User" },
    { email: "jane@example.com", password: "Password123", name: "Jane Doe" },
  ];

  const customers = {};
  for (const spec of customerSpecs) {
    let customer = await User.findOne({ email: spec.email });
    if (!customer) {
      customer = await User.create({
        name: spec.name,
        email: spec.email,
        password: await hashPassword(spec.password),
        role: "customer",
      });
      console.log(`Customer created: ${spec.email}`);
    } else {
      console.log(`Customer already exists: ${spec.email}`);
    }
    customers[spec.email] = customer;
  }

  const categoryNames = ["Electronics", "Clothing", "Home & Kitchen", "Books"];
  const categories = {};
  for (const name of categoryNames) {
    let category = await Category.findOne({ name });
    if (!category) {
      category = await Category.create({ name, slug: slugify(name) });
      console.log(`Category created: ${name}`);
    }
    categories[name] = category;
  }

  const sampleProducts = [
    { name: "Wireless Mouse", description: "A responsive 2.4GHz wireless mouse.", price: 250, stock: 40, category: "Electronics", images: ["https://images.unsplash.com/photo-1611850698562-ae3d28934080?w=800&auto=format&fit=crop&q=80"] },
    { name: "Mechanical Keyboard", description: "Tactile mechanical keyboard with RGB backlight.", price: 899, stock: 25, category: "Electronics", images: ["https://images.unsplash.com/photo-1520092352425-9699926a9b0b?w=800&auto=format&fit=crop&q=80"] },
    { name: "Cotton T-Shirt", description: "Soft, breathable 100% cotton t-shirt.", price: 199, stock: 100, category: "Clothing", images: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80"] },
    { name: "Non-Stick Frying Pan", description: "26cm non-stick frying pan, dishwasher safe.", price: 349, stock: 15, category: "Home & Kitchen", images: ["https://images.unsplash.com/photo-1581147036217-6f4bd9074fef?w=800&auto=format&fit=crop&q=80"] },
    { name: "Clean Code", description: "A Handbook of Agile Software Craftsmanship.", price: 450, stock: 30, category: "Books", images: ["https://images.unsplash.com/photo-1585521607120-182732851afe?w=800&auto=format&fit=crop&q=80"] },
  ];

  const products = {};
  for (const p of sampleProducts) {
    let product = await Product.findOne({ name: p.name });
    if (!product) {
      product = await Product.create({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: categories[p.category]._id,
        images: p.images,
      });
      console.log(`Product created: ${p.name}`);
    }
    products[p.name] = product;
  }

  // Seed reviews (unique per product + user at the database level).
  const reviewSpecs = [
    { product: "Wireless Mouse", email: "testuser@example.com", rating: 4, comment: "Works well and is very responsive for everyday use." },
    { product: "Wireless Mouse", email: "admin@shopsphere.com", rating: 5, comment: "Excellent value for money." },
    { product: "Mechanical Keyboard", email: "testuser@example.com", rating: 5, comment: "Great tactile feel, the RGB is a bonus." },
    { product: "Cotton T-Shirt", email: "jane@example.com", rating: 4, comment: "Comfortable fabric, fits true to size." },
    { product: "Non-Stick Frying Pan", email: "jane@example.com", rating: 4, comment: "Even heating and easy to clean." },
    { product: "Clean Code", email: "admin@shopsphere.com", rating: 5, comment: "Essential reading for every developer." },
    { product: "Clean Code", email: "testuser@example.com", rating: 4, comment: "Practical examples that changed how I write code." },
  ];

  for (const spec of reviewSpecs) {
    const product = products[spec.product];
    const user = customers[spec.email] ?? admin;
    const existing = await Review.findOne({ product: product._id, user: user._id });
    if (!existing) {
      await Review.create({
        product: product._id,
        user: user._id,
        rating: spec.rating,
        comment: spec.comment,
      });
      console.log(`Review created: ${spec.product} by ${spec.email}`);
    }
  }

  // Seed cart for the test user.
  let testCart = await Cart.findOne({ owner: customers["testuser@example.com"]._id });
  if (!testCart) {
    await Cart.create({
      owner: customers["testuser@example.com"]._id,
      items: [{ product: products["Mechanical Keyboard"]._id, quantity: 1 }],
    });
    console.log("Cart created for testuser@example.com");
  }

  // Seed sample orders with item price snapshots and computed totals.
  const seedOrders = [
    {
      owner: customers["testuser@example.com"],
      shippingAddress: { street: "12 Long Street", city: "Cape Town", postalCode: "8001", country: "South Africa" },
      paymentMethod: "card",
      status: "completed",
      items: [
        { product: products["Wireless Mouse"]._id, name: "Wireless Mouse", price: 250, quantity: 1 },
        { product: products["Clean Code"]._id, name: "Clean Code", price: 450, quantity: 1 },
      ],
    },
    {
      owner: customers["jane@example.com"],
      shippingAddress: { street: "7 Oak Avenue", city: "Johannesburg", postalCode: "2001", country: "South Africa" },
      paymentMethod: "cod",
      status: "pending",
      items: [
        { product: products["Cotton T-Shirt"]._id, name: "Cotton T-Shirt", price: 199, quantity: 1 },
        { product: products["Non-Stick Frying Pan"]._id, name: "Non-Stick Frying Pan", price: 349, quantity: 2 },
      ],
    },
  ];

  for (const spec of seedOrders) {
    const items = spec.items.map((item) => ({ ...item, total: round2(item.price * item.quantity) }));
    const subtotal = round2(items.reduce((sum, item) => sum + item.total, 0));
    const shippingFee = subtotal >= 500 ? 0 : 60;
    const tax = round2(subtotal * 0.15);
    const total = round2(subtotal + shippingFee + tax);

    const existing = await Order.findOne({ owner: spec.owner._id, status: spec.status });
    if (!existing) {
      await Order.create({
        owner: spec.owner._id,
        orderNumber: orderNumber(),
        items,
        subtotal,
        shippingFee,
        tax,
        total,
        shippingAddress: spec.shippingAddress,
        paymentMethod: spec.paymentMethod,
        status: spec.status,
      });
      console.log(`Order created for ${spec.owner.email}`);
    }
  }

  console.log("Done.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});