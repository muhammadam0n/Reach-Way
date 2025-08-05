import React, { useState, useEffect } from "react";
import Container from "../../Components/Container";
import { Card, CardContent, Typography, Grid, Chip, Button } from '@mui/material';
import { format } from 'date-fns';

const BulkUpload = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "GET"
      });
      const data = await response.json();
      console.log("[DATA]:", data);
      setPosts(data);
    } catch (err) {
      console.log("[ERROR]:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getPostStatus = (post) => {
    const now = new Date();
    const scheduledTime = new Date(post.scheduledDateTime);
    
    if (post.status === "posted") return "Posted";
    if (now >= scheduledTime) return "Pending Publish";
    return "Scheduled";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Posted": return "success";
      case "Pending Publish": return "warning";
      case "Scheduled": return "info";
      default: return "default";
    }
  };

  const handleDelete = async (postId) => {
    try {
      await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE"
      });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <Container search>
      <div className="lg:w-[84%] md:py-8 py-5">
        <h1 className="text-2xl pb-4 font-bold">Uploaded or Scheduled Posts</h1>
        <Grid container spacing={3}>
          {posts.map((post) => {
            const status = getPostStatus(post);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={post._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  minHeight: '400px' // Consistent minimum height
                }}>
                  {post.image && (
                    <div style={{ 
                      width: '100%',
                      height: '200px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={post.image}
                        alt="Post content"
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  <CardContent sx={{ 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {post.description || 'No description'}
                    </Typography>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <Chip 
                        label={post.platform} 
                        color="primary" 
                        size="small" 
                        style={{ marginRight: '0.5rem' }} 
                      />
                      <Chip 
                        label={post.postType} 
                        color="secondary" 
                        size="small" 
                      />
                      <Chip 
                        label={status}
                        color={getStatusColor(status)}
                        size="small"
                        style={{ marginLeft: '0.5rem' }}
                      />
                    </div>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {post.scheduledDateTime ? 
                        `Scheduled: ${format(new Date(post.scheduledDateTime), 'PPPpp')}` : 
                        'Posted'}
                    </Typography>
                    
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </Container>
  );
};

export default BulkUpload;