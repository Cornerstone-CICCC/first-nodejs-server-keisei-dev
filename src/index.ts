import http from 'http';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

let posts: Post[] = [
  { userId: 1, id: 1, title: "First post", body: "This is my first post" },
  { userId: 1, id: 2, title: "Second post", body: "This is my second post" },
];

let nextId = 3;

const server = http.createServer((req, res) => {
  const url = req.url || '';
  const method = req.method || '';

  res.setHeader('Content-Type', 'application/json');

  if (url === '/posts' && method === 'GET') {
    res.statusCode = 200;
    res.end(JSON.stringify(posts));
    return;
  }

  if (url.match(/^\/posts\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/')[2]);
    const post = posts.find(p => p.id === id);

    if (!post) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Post not found" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(post));
    return;
  }

  if (url === '/posts' && method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      let parsedBody;

      try {
        parsedBody = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }

      const { userId, title, body: postBody } = parsedBody;
      const newPost: Post = {
        userId: userId,
        id: nextId++,
        title: title,
        body: postBody
      };
      posts.push(newPost);

      res.statusCode = 201;
      res.end(JSON.stringify(newPost));
    });
    return;
  }

  if (url.match(/^\/posts\/\d+$/) && method === 'PUT') {
    const id = parseInt(url.split('/')[2]);
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Post not found" }));
      return;
    }

    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      let parsedBody;

      try {
        parsedBody = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }

      const { userId, title, body: postBody } = parsedBody;
      posts[index] = {
        ...posts[index],
        userId: userId ?? posts[index].userId,
        title: title ?? posts[index].title,
        body: postBody ?? posts[index].body
      };

      res.statusCode = 200;
      res.end(JSON.stringify(posts[index]));
    });
    return;
  }

  if (url.match(/^\/posts\/\d+$/) && method === 'DELETE') {
    const id = parseInt(url.split('/')[2]);
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Post not found" }));
      return;
    }

    posts.splice(index, 1);
    res.statusCode = 200;
    res.end(JSON.stringify({ message: "Post deleted" }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Route not found" }));
});

const PORT = 3000;

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error(err.message);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
