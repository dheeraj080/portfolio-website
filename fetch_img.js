// built-in fetch in node 18+
fetch("http://localhost:3000/_next/image?url=https%3A%2F%2Fportfolio-animation1.s3.eu-north-1.amazonaws.com%2Fphotos%2Fe090b7ca-2287-4e04-952e-7ff9dccd78c9b6e-(4)-1772532158342.jpg&w=384&q=75")
  .then(res => {
    console.log(res.status);
    return res.text();
  })
  .then(console.log);
