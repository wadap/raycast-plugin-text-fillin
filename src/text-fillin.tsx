import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  LocalStorage,
  closeMainWindow,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";

const DRAFT_STORAGE_KEY = "text-fillin-draft";
const HISTORY_STORAGE_KEY = "text-fillin-history";
const MAX_HISTORY_ITEMS = 50;

type HistoryItem = {
  id: string;
  text: string;
  createdAt: string;
};

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await LocalStorage.getItem<string>(DRAFT_STORAGE_KEY);
      if (draft) {
        setText(draft);
      }
      setIsReady(true);
    };

    loadDraft();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    LocalStorage.setItem(DRAFT_STORAGE_KEY, text);
  }, [text, isReady]);

  const handleSubmit = async () => {
    const normalizedText = text ?? "";

    if (!normalizedText.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Text is empty",
        message: "Type something before submitting.",
      });
      return;
    }

    try {
      setIsLoading(true);
      await appendHistory(normalizedText);
      await LocalStorage.setItem(DRAFT_STORAGE_KEY, "");
      await closeMainWindow();
      await Clipboard.paste(normalizedText);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to paste text",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      isLoading={isLoading || !isReady}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Fill Text"
            onSubmit={handleSubmit}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Write temporary text and press Cmd+Enter to fill it into the previously focused app." />
      <Form.TextArea
        id="text"
        title="Text"
        placeholder="Type text here..."
        autoFocus
        value={text}
        onChange={setText}
      />
    </Form>
  );
}

async function appendHistory(text: string) {
  const historyRaw = await LocalStorage.getItem<string>(HISTORY_STORAGE_KEY);
  const history = parseHistory(historyRaw);
  const next: HistoryItem = {
    id: generateId(),
    text,
    createdAt: new Date().toISOString(),
  };
  const updated = [next, ...history].slice(0, MAX_HISTORY_ITEMS);
  await LocalStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseHistory(value: string | undefined): HistoryItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
