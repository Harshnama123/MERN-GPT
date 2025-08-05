import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import './ChatItem.css';

interface MarkdownContentProps {
  content: string;
}

interface ChatItemProps {
  content: string;
  role: "user" | "assistant";
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <Box className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => (
            <Typography sx={{ fontSize: "20px", mb: 1 }}>{children}</Typography>
          ),
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return !isInline ? (
              <SyntaxHighlighter
                {...props}
                style={coldarkDark as any}
                language={match?.[1] || 'text'}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          ol: ({ children }) => (
            <Typography component="ol" sx={{ pl: 2, mb: 1 }}>
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
            <Typography component="ul" sx={{ pl: 2, mb: 1 }}>
              {children}
            </Typography>
          ),
          li: ({ children }) => (
            <Typography component="li" sx={{ fontSize: "20px" }}>
              {children}
            </Typography>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

const ChatItem: React.FC<ChatItemProps> = ({ content, role }) => {
  const auth = useAuth();
  
  return (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: role === "assistant" ? "#004d5612" : "#004d56",
        gap: 2,
        borderRadius: 2,
        my: role === "assistant" ? 1 : 0,
      }}
    >
      <Avatar 
        sx={{ 
          ml: "0",
          ...(role === "user" && { bgcolor: "black", color: "white" })
        }}
      >
        {role === "assistant" ? (
          <img src="openai.png" alt="openai" width={"30px"} />
        ) : (
          <>
            {auth?.user?.name[0]}
            {auth?.user?.name.split(" ")[1]?.[0]}
          </>
        )}
      </Avatar>
      <Box sx={{ width: "100%" }}>
        <MarkdownContent content={content} />
      </Box>
    </Box>
  );
};

export default ChatItem;