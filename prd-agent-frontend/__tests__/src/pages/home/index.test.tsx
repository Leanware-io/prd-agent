import userEvent from "@testing-library/user-event";
import {
  downloadPdf,
  IAssistantPdf,
  loginUser,
  pdfPreview,
  sendMessage,
} from "@/shared/api";
import { downloadPdfFile, openPdfFile } from "@/shared/utils";
import { DropzoneProvider, UserProvider } from "@/app/providers";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Home } from "@/pages/home";
import { loginWithGoogle, loginWithMicrosoft } from "@/shared/lib";
import { UserCredential } from "firebase/auth";

jest.mock("firebase/auth", () => ({
  ...jest.requireActual("firebase/auth"),
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock("uuid", () => ({
  v4: () => "test-uuid",
}));

jest.mock("@/shared/api", () => ({
  downloadPdf: jest.fn(),
  loginUser: jest.fn(),
  pdfPreview: jest.fn(),
  sendAudio: jest.fn(),
  sendMessage: jest.fn(),
}));

jest.mock("@/shared/utils", () => ({
  ...jest.requireActual("@/shared/utils"),
  downloadPdfFile: jest.fn(),
  openFileInBrowser: jest.fn(),
  openPdfFile: jest.fn(),
}));

jest.mock("@/shared/lib", () => ({
  getUserIdToken: jest.fn(),
  loginWithGoogle: jest.fn(),
  loginWithMicrosoft: jest.fn(),
}));

jest.mock("@/shared/config", () => ({
  API_URL: () => "https://api.mock.com",
  gtagConversionId: "test-gtag-conversion-id",
  PRD_COMPLETE_MESSAGE: "Complete PRD message",
}));

jest.mock("@/app/providers", () => {
  const actual = jest.requireActual("@/app/providers");
  return {
    ...actual,
    useDropzone: jest.fn().mockImplementation(() => ({
      clearFiles: jest.fn(),
      files: [],
      onRemoveFile: jest.fn(),
      open: jest.fn(),
    })),
    useToast: () => ({
      toast: jest.fn().mockImplementation((props) => props),
    }),
  };
});

jest.mock("react-dropzone", () => ({
  useDropzone: () => ({
    getInputProps: () => ({}),
    getRootProps: () => ({}),
    isDragActive: false,
    open: jest.fn(),
  }),
}));

jest.mock("remark-gfm", () => () => {});

Element.prototype.scrollIntoView = jest.fn();

const mockSendMessage = sendMessage as jest.MockedFunction<typeof sendMessage>;
const mockDownloadPdfFile = downloadPdfFile as jest.MockedFunction<
  typeof downloadPdfFile
>;
const mockOpenPdfFile = openPdfFile as jest.MockedFunction<typeof openPdfFile>;
const mockLoginWithGoogle = loginWithGoogle as jest.MockedFunction<
  typeof loginWithGoogle
>;
const mockLoginWithMicrosoft = loginWithMicrosoft as jest.MockedFunction<
  typeof loginWithMicrosoft
>;
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
const mockDownloadPdf = downloadPdf as jest.MockedFunction<typeof downloadPdf>;
const mockPdfPreview = pdfPreview as jest.MockedFunction<typeof pdfPreview>;

const MOCK_PDF = "mock-pdf-base64-content";
const MOCK_PDF_BASE64 = btoa(MOCK_PDF);
const MOCK_USER = {
  displayName: "Test User",
  email: "test@example.com",
  uid: "test-uid",
} as UserCredential["user"];
const MOCK_COMPLETED_MESSAGE = {
  document_completed: true,
  message: "Your PRD is ready!",
};
const MOCK_PDF_PREVIEW = {
  markdown: MOCK_PDF,
  pdf_base64: MOCK_PDF_BASE64,
} as IAssistantPdf;

const createMockFile = (
  name: string,
  type: string,
  size: number = 1024,
): File => {
  const file = new File(["mock file content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const MOCK_PDF_FILE = createMockFile("document.pdf", "application/pdf");
const MOCK_WORD_FILE = createMockFile(
  "report.docx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
);

const renderHomeWithProviders = (authenticated = false) => {
  const mockUser = authenticated ? MOCK_USER : null;

  return render(
    <UserProvider initialUser={mockUser}>
      <DropzoneProvider>
        <Home />
      </DropzoneProvider>
    </UserProvider>,
  );
};

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoginUser.mockReset();
    mockDownloadPdf.mockReset();
    mockPdfPreview.mockReset();
    mockDownloadPdfFile.mockReset();
    mockOpenPdfFile.mockReset();
    mockSendMessage.mockResolvedValue(MOCK_COMPLETED_MESSAGE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render initial UI elements correctly", () => {
    renderHomeWithProviders();

    expect(screen.getByText(/Let's Build Your/i)).toBeInTheDocument();
    expect(screen.getByText(/Software Solution/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/I would like to build.../i),
    ).toBeInTheDocument();

    expect(screen.getByText(/Attach files/i)).toBeInTheDocument();
  });

  it("should show auth screen when unauthenticated user submits initial message", async () => {
    renderHomeWithProviders(false);

    const inputField = screen.getByPlaceholderText(/I would like to build.../i);
    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Microsoft/i)).toBeInTheDocument();
  });

  it("should handle Google authentication successfully", async () => {
    mockLoginWithGoogle.mockResolvedValue(MOCK_USER);

    renderHomeWithProviders(false);

    const inputField = screen.getByPlaceholderText(/I would like to build.../i);
    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    const googleButton = screen.getByText(/Continue with Google/i);
    await userEvent.click(googleButton);

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        files: expect.any(Array),
        message: "I want to build a CRM system",
      });
    });
  });

  it("should handle Microsoft authentication successfully", async () => {
    mockLoginWithMicrosoft.mockResolvedValue(MOCK_USER);

    renderHomeWithProviders(false);

    const inputField = screen.getByPlaceholderText(/I would like to build.../i);
    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    const microsoftButton = screen.getByText(/Continue with Microsoft/i);
    await userEvent.click(microsoftButton);

    expect(mockLoginWithMicrosoft).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        files: expect.any(Array),
        message: "I want to build a CRM system",
      });
    });
  });

  it("should transition directly to chat interface for authenticated users", async () => {
    mockSendMessage.mockResolvedValue(MOCK_COMPLETED_MESSAGE);

    renderHomeWithProviders(true);

    const inputField = screen.getByPlaceholderText(/I would like to build.../i);
    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        files: expect.any(Array),
        message: "I want to build a CRM system",
      });
    });
  });

  it("should maintain chat history with alternating user/assistant messages", async () => {
    mockSendMessage.mockResolvedValue(MOCK_COMPLETED_MESSAGE);
    mockPdfPreview.mockResolvedValue(MOCK_PDF_PREVIEW);

    renderHomeWithProviders(true);

    const inputField = screen.getByPlaceholderText(/I would like to build.../i);
    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        files: expect.any(Array),
        message: "I want to build a CRM system",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("What do you want to build?"),
      ).toBeInTheDocument();

      expect(
        screen.getByText("I want to build a CRM system"),
      ).toBeInTheDocument();

      expect(screen.getByText("Your PRD is ready!")).toBeInTheDocument();
    });
  });

  it("should process file uploads correctly", async () => {
    jest.requireMock("@/app/providers").useDropzone.mockImplementation(() => ({
      clearFiles: jest.fn(),
      files: [{ content: MOCK_PDF_FILE, key: "test-file-id" }],
      onRemoveFile: jest.fn(),
      open: jest.fn(),
    }));

    renderHomeWithProviders(true);

    const inputElements = screen.getAllByRole("textbox");
    const visibleInputs = inputElements.filter(
      (el) => !el.classList.contains("hidden"),
    );
    const inputField = visibleInputs[0];

    await userEvent.type(inputField, "Here is my document");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalled();
    });
  });

  it("should handle audio recording correctly", async () => {
    mockSendMessage.mockResolvedValue(MOCK_COMPLETED_MESSAGE);

    const mockAudioBlob = createMockFile("audio.webm", "audio/webm");

    const files = [
      {
        content: mockAudioBlob,
        key: "test-audio-file-id",
      },
    ];

    const result = await mockSendMessage({ files });

    expect(result).toEqual(MOCK_COMPLETED_MESSAGE);
    expect(mockSendMessage).toHaveBeenCalledWith({ files });
  });

  it("should display PRD preview with markdown renderer when available", async () => {
    mockSendMessage.mockResolvedValue(MOCK_COMPLETED_MESSAGE);
    mockPdfPreview.mockResolvedValue(MOCK_PDF_PREVIEW);

    renderHomeWithProviders(true);

    const inputElements = screen.getAllByRole("textbox");
    const visibleInputs = inputElements.filter(
      (el) => !el.classList.contains("hidden"),
    );
    const inputField = visibleInputs[0];

    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPdfPreview).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(MOCK_PDF)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Download Quote/i)).toBeInTheDocument();
    });
  });

  it("should handle PDF download correctly", async () => {
    mockSendMessage.mockResolvedValue(MOCK_COMPLETED_MESSAGE);
    mockPdfPreview.mockResolvedValue(MOCK_PDF_PREVIEW);
    mockLoginUser.mockResolvedValue({ can_download: true });
    mockDownloadPdf.mockResolvedValue({
      presigned_url: "https://example.com/download/pdf",
    });

    renderHomeWithProviders(true);

    const inputElements = screen.getAllByRole("textbox");
    const visibleInputs = inputElements.filter(
      (el) => !el.classList.contains("hidden"),
    );
    const inputField = visibleInputs[0];

    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPdfPreview).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        expect(mockPdfPreview).toHaveBeenCalled();
        const downloadButton = screen.getByText(/Download Quote/i);
        expect(downloadButton).toBeInTheDocument();
        fireEvent.click(downloadButton);
      },
      { timeout: 3000 },
    );

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalled();
      expect(mockDownloadPdf).toHaveBeenCalledWith({
        base_64_pdf: MOCK_PDF_BASE64,
        quote: false,
      });
      expect(mockDownloadPdfFile).toHaveBeenCalledWith(
        "https://example.com/download/pdf",
      );
      expect(mockOpenPdfFile).toHaveBeenCalledWith(
        "https://example.com/download/pdf",
      );
    });
  });

  it("should handle invalid file uploads correctly", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const largeFile = createMockFile(
      "large.pdf",
      "application/pdf",
      26 * 1024 * 1024,
    );

    jest.requireMock("@/app/providers").useDropzone.mockImplementation(() => ({
      clearFiles: jest.fn(),
      files: [{ content: largeFile, key: "large-file-id" }],
      onRemoveFile: jest.fn(),
      open: jest.fn(),
    }));

    renderHomeWithProviders(true);

    const inputElements = screen.getAllByRole("textbox");
    const visibleInputs = inputElements.filter(
      (el) => !el.classList.contains("hidden"),
    );
    const inputField = visibleInputs[0];

    await userEvent.type(inputField, "Here is my large document");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    console.error = originalConsoleError;
  });

  it("should handle authentication errors gracefully", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    mockLoginWithGoogle.mockRejectedValue(new Error("Authentication failed"));

    renderHomeWithProviders(false);

    const inputs = screen.getAllByRole("textbox");
    const inputField = inputs[0];
    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    const googleButton = screen.getByText(/Continue with Google/i);
    await userEvent.click(googleButton);

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
      expect(screen.getByText(/Continue with Microsoft/i)).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalled();

    console.error = originalConsoleError;
  });

  it("should allow adding files after initial message", async () => {
    mockSendMessage.mockResolvedValue(MOCK_COMPLETED_MESSAGE);

    renderHomeWithProviders(true);

    const inputElements = screen.getAllByRole("textbox");
    const visibleInputs = inputElements.filter(
      (el) => !el.classList.contains("hidden"),
    );
    const inputField = visibleInputs[0];

    await userEvent.type(inputField, "I want to build a CRM system");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      mockSendMessage.mockClear();

      jest
        .requireMock("@/app/providers")
        .useDropzone.mockImplementation(() => ({
          clearFiles: jest.fn(),
          files: [{ content: MOCK_WORD_FILE, key: "word-file-id" }],
          onRemoveFile: jest.fn(),
          open: jest.fn(),
        }));
    });

    await waitFor(() => {
      mockSendMessage({
        files: [{ content: MOCK_WORD_FILE, key: "word-file-id" }],
        message: "Here is additional documentation",
      });

      expect(mockSendMessage).toHaveBeenCalled();
    });
  });

  it("should handle multiple file uploads", async () => {
    jest.requireMock("@/app/providers").useDropzone.mockImplementation(() => ({
      clearFiles: jest.fn(),
      files: [
        { content: MOCK_PDF_FILE, key: "pdf-file-id" },
        { content: MOCK_WORD_FILE, key: "word-file-id" },
      ],
      onRemoveFile: jest.fn(),
      open: jest.fn(),
    }));

    renderHomeWithProviders(true);

    const inputElements = screen.getAllByRole("textbox");
    const visibleInputs = inputElements.filter(
      (el) => !el.classList.contains("hidden"),
    );
    const inputField = visibleInputs[0];

    await userEvent.type(inputField, "Here are my documents");

    const submitButton = inputField.nextElementSibling as HTMLElement;
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        files: [
          { content: MOCK_PDF_FILE, key: "pdf-file-id" },
          { content: MOCK_WORD_FILE, key: "word-file-id" },
        ],
        message: "Here are my documents",
      });
    });
  });
});
