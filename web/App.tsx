import React from "react";
import { invoke } from "@tauri-apps/api";

type TMessage = {
  text: string;
  self: boolean;
};

function Message(props: { message: TMessage }) {
  const isSelf = props.message.self;
  const messageClass = isSelf
    ? "bg-gray-200 text-black rounded-lg px-3 py-2 max-w-lg"
    : "bg-blue-500 text-white rounded-lg px-3 py-2 max-w-lg";
  return (
    <div
      className={`flex items-end gap-2 ${
        isSelf ? "flex-row-reverse self-end" : ""
      }`}
    >
      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
        <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          {isSelf ? "You" : "AI"}
        </span>
      </span>
      <div className={messageClass}>
        <span>{props.message.text}</span>
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = React.useState<TMessage[]>([
    { self: false, text: "Hi! How can I help you today?" },
  ]);
  const [text, setText] = React.useState<string>("");

  const addMessage = (message: TMessage) => {
    setMessages((prevMessages) => [message, ...prevMessages]);
  };

  React.useEffect(() => {
    if (messages.length && messages[0].self) {
      invoke("answer", { msg: messages[0].text })
        .then((response) => {
          addMessage({ self: false, text: response as string });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    addMessage({ text: text, self: true });
    setText("");
  };

  return (
    <div className="w-screen h-screen bg-gray-100 p-4 flex flex-col">
      <div className="flex flex-1 overflow-y-auto flex-col-reverse gap-4 p-4">
        {messages && messages.map((message, index) => <Message key={index} message={message} />)}
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2 items-center">
          <textarea
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-grow rounded-lg"
            placeholder="Type your message here."
          ></textarea>
          <button
            disabled={!text}
            onClick={handleSendMessage}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 bg-blue-500 text-white"
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
