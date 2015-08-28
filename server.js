require('harp').server(__dirname, { port: process.env.PORT || 5000 })
console.log('HARP SERVER STARTED')
console.log('SERVER IS RUNNING ON PORT ',process.env.PORT || 5000)
console.log('SERVER ENV IS ', process.env.NODE_ENV || 'development')
