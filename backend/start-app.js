const { connectDB } = require('./backend/database');

async function startApp() {
  try {
    console.log('🚀 Starting Daily Coding Challenge Application...');
    
    // Test MongoDB connection
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Start the server
    require('./backend/server');
    
    console.log('🌐 Application started successfully!');
    console.log('📱 Open your browser and go to: http://localhost:3000');
    console.log('👤 Login credentials:');
    console.log('   Admin: admin/admin123');
    console.log('   Faculty: faculty1/faculty123');
    console.log('   Student: student1/student123');
    
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

startApp();