import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Image,
  Modal,
  Form,
  Input,
  Upload,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import api from "../../../api/AxiosInterceptor";
import ENDPOINTS from "../../../Utils/Endpoints";
import { IMAGES } from "../../../Utils/images";

const { Paragraph, Text } = Typography;

const PostCard = () => {
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  const handleUpload = async () => {
    const facebookPosts = posts.filter((post) => post.platform === "facebook");
    if (facebookPosts.length === 0) return;

    const formattedPosts = facebookPosts.map((post) => ({
      _id: post._id,
      platform: post.platform,
      message: post.description,
      image_url: post.image,
      page_id: post.pageID,
      scheduled_time: Math.floor(new Date(post.date).getTime() / 1000),
      page_access_token: post.pageAccessToken,
    }));

    try {
      const response = await api.post({
        url: ENDPOINTS.OTHER.SCHEDULE_FACEBOOK_POST,
        data: { posts: formattedPosts },
      });
      console.log("Upload response:", response);
    } catch (error) {
      console.error("Batch upload error:", error.message);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get({ url: `${ENDPOINTS.OTHER.GET_POSTS}` });
        setPosts(response);
      } catch (error) {
        // Handle error
      }
    };
    fetchPosts();
  }, []);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "facebook":
        return IMAGES.FACEBOOK;
      case "linkedin":
        return IMAGES.LINKEDIN;
      case "threads":
        return IMAGES.THREADS;
      case "instagram":
        return IMAGES.INSTA;
      default:
        return IMAGES.ADDICON;
    }
  };

  const handleCardClick = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
    editForm.setFieldsValue({
      description: post.description,
      image: null,
    });
  };

  const handleDelete = (post) => {
    console.log("delete", post);
    // You can add your delete logic here
  };

  const handleEditSubmit = (values) => {
    // Here you would update the post in your backend or state
    console.log("Edit values:", values);
    setEditModalOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        {posts.map((member, ind) => (
          <Col xs={24} sm={12} md={8} lg={6} key={ind}>
            <Card
              hoverable
              onClick={() => handleCardClick(member)}
              cover={
                <div style={{ position: "relative" }}>
                  <Image
                    src={member.image}
                    alt="Main"
                    style={{
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                    preview={false}
                  />
                  <Image
                    src={getPlatformIcon(member.platform)}
                    alt="Platform Icon"
                    style={{
                      position: "absolute",
                      left: 16,
                      bottom: 8,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#fff",
                      padding: 4,
                    }}
                    preview={false}
                  />
                </div>
              }
              style={{ borderRadius: 16, minHeight: 350 }}
              bodyStyle={{ padding: 16, position: "relative" }}
              actions={[
                <EditOutlined
                  key="edit"
                  style={{ color: "#1890ff" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(member);
                  }}
                />,
                <Popconfirm
                  key="delete"
                  title="Are you sure you want to delete this post?"
                  onConfirm={(e) => {
                    e.stopPropagation();
                    handleDelete(member);
                  }}
                  onCancel={(e) => e && e.stopPropagation()}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined
                    style={{ color: "#ff4d4f" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>,
              ]}
            >
              <Text strong>{member.heading}</Text>
              <div style={{ margin: "8px 0", color: "#888" }}>
                <Text>
                  {new Date(member.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </Text>
                <span style={{ margin: "0 8px" }}>|</span>
                <Text>
                  {(() => {
                    const d = new Date(member.date);
                    return `${String(d.getDate()).padStart(2, "0")}/${String(
                      d.getMonth() + 1
                    ).padStart(2, "0")}/${d.getFullYear()}`;
                  })()}
                </Text>
              </div>
              <Paragraph ellipsis={{ rows: 3, expandable: false }}>
                <span style={{ color: "#1890ff" }}>{member.description}</span>
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
      <Button
        type="primary"
        size="large"
        style={{ marginTop: 32, borderRadius: 6 }}
        onClick={handleUpload}
      >
        Upload
      </Button>

      {/* View Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={selectedPost?.heading}
      >
        {selectedPost && (
          <>
            <Image
              src={selectedPost.image}
              alt="Main"
              style={{ width: "100%", borderRadius: 12, marginBottom: 16 }}
              preview={false}
            />
            <Paragraph>
              <span style={{ color: "#1890ff" }}>
                {selectedPost.description}
              </span>
            </Paragraph>
            <div style={{ color: "#888" }}>
              <Text>
                {new Date(selectedPost.date).toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </Text>
              <span style={{ margin: "0 8px" }}>|</span>
              <Text>
                {(() => {
                  const d = new Date(selectedPost.date);
                  return `${String(d.getDate()).padStart(2, "0")}/${String(
                    d.getMonth() + 1
                  ).padStart(2, "0")}/${d.getFullYear()}`;
                })()}
              </Text>
              <span style={{ margin: "0 8px" }}>|</span>
              <Text>
                {new Date(selectedPost.date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </div>
          </>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        title="Edit Post"
        onOk={() => editForm.submit()}
        okText="Save"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={{
            description: selectedPost?.description,
            image: null,
          }}
        >
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              defaultFileList={
                selectedPost?.image
                  ? [
                      {
                        uid: "-1",
                        name: "image.png",
                        status: "done",
                        url: selectedPost.image,
                      },
                    ]
                  : []
              }
            >
              <Button icon={<UploadOutlined />}>Change Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostCard;
