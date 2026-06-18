const { FoodType, Menu } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Create food types
    console.log('Creating food types...');
    const starters = await FoodType.create('Starters & Appetizers');
    const mainCourse = await FoodType.create('Main Course');
    const desserts = await FoodType.create('Desserts');
    const beverages = await FoodType.create('Beverages');
    const breads = await FoodType.create('Breads');

    // Starters
    await Menu.create(
      'Paneer Tikka',
      'Creamy paneer cubes marinated in yogurt and spices, grilled to perfection',
      250,
      starters.id,
      'https://images.unsplash.com/photo-1599599810694-b5ac4dd37b1b?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Chicken 65',
      'Spicy and crispy fried chicken, a South Indian delicacy',
      280,
      starters.id,
      'https://images.unsplash.com/photo-1599599810545-a16d32d37f9f?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Samosa (3 pieces)',
      'Crispy pastry filled with spiced potatoes and peas',
      120,
      starters.id,
      'https://images.unsplash.com/photo-1599599810694-d1e0e7d33c0c?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Spring Rolls (4 pieces)',
      'Crispy vegetable spring rolls served with sweet chili sauce',
      180,
      starters.id,
      'https://images.unsplash.com/photo-1599599810694-d1e0e7d33c0d?w=400&h=300&fit=crop'
    );

    // Main Course
    await Menu.create(
      'Butter Chicken',
      'Tender chicken in creamy tomato and butter sauce with aromatic spices',
      320,
      mainCourse.id,
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Biryani (Chicken)',
      'Fragrant basmati rice cooked with tender chicken and traditional spices',
      300,
      mainCourse.id,
      'https://images.unsplash.com/photo-1589521471516-b47d0e79e1b1?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Tandoori Chicken',
      'Marinated in yogurt and spices, grilled in traditional tandoor',
      350,
      mainCourse.id,
      'https://images.unsplash.com/photo-1608834322127-b43ec51b2d00?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Palak Paneer',
      'Fresh spinach cooked with soft paneer cubes in creamy sauce',
      270,
      mainCourse.id,
      'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Chole Bhature',
      'Fluffy fried bread served with spiced chickpea curry',
      180,
      mainCourse.id,
      'https://images.unsplash.com/photo-1609501676725-7186f017a4b1?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Fish Curry',
      'Fresh fish in aromatic coconut and spiced curry',
      380,
      mainCourse.id,
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc029?w=400&h=300&fit=crop'
    );

    // Breads
    await Menu.create(
      'Naan',
      'Soft, fluffy Indian bread baked in tandoor, perfect with curries',
      60,
      breads.id,
      'https://images.unsplash.com/photo-1618069254389-8b29c6f0a8c6?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Garlic Naan',
      'Fragrant naan infused with fresh garlic and herbs',
      80,
      breads.id,
      'https://images.unsplash.com/photo-1618069254389-8b29c6f0a8c7?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Roti',
      'Traditional whole wheat flatbread',
      40,
      breads.id,
      'https://images.unsplash.com/photo-1618069254389-8b29c6f0a8c8?w=400&h=300&fit=crop'
    );

    // Desserts
    await Menu.create(
      'Gulab Jamun',
      'Soft dumplings soaked in sweet cardamom syrup',
      120,
      desserts.id,
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Kheer',
      'Creamy rice pudding flavored with cardamom and nuts',
      100,
      desserts.id,
      'https://images.unsplash.com/photo-1578985545062-69928b1d9588?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Rasgulla',
      'Soft spongy cheese balls in sweet syrup',
      110,
      desserts.id,
      'https://images.unsplash.com/photo-1578985545062-69928b1d9589?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Jalebi',
      'Crispy fried sweet made with all-purpose flour soaked in sugar syrup',
      80,
      desserts.id,
      'https://images.unsplash.com/photo-1577003833154-a92bbd0f2d2e?w=400&h=300&fit=crop'
    );

    // Beverages
    await Menu.create(
      'Mango Lassi',
      'Refreshing yogurt-based drink with fresh mango',
      80,
      beverages.id,
      'https://images.unsplash.com/photo-1585328707894-d973c4f29b3e?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Sweet Lassi',
      'Creamy yogurt drink with cardamom and rose water',
      70,
      beverages.id,
      'https://images.unsplash.com/photo-1585328707894-d973c4f29b3f?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Fresh Lemonade',
      'Freshly squeezed lime juice with mint and sugar',
      60,
      beverages.id,
      'https://images.unsplash.com/photo-1585328707894-d973c4f29b40?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Iced Tea',
      'Chilled herbal tea with lemon and mint',
      50,
      beverages.id,
      'https://images.unsplash.com/photo-1585328707894-d973c4f29b41?w=400&h=300&fit=crop'
    );

    await Menu.create(
      'Masala Chai',
      'Traditional spiced Indian tea with milk',
      40,
      beverages.id,
      'https://images.unsplash.com/photo-1585328707894-d973c4f29b42?w=400&h=300&fit=crop'
    );

    console.log('✅ Database seeded successfully!');
    console.log('🍽️ Added 23 menu items across 5 categories');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
