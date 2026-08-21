import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FlashcardView } from "@/components/FlashcardView";
import type { SessionState } from "@/types/session";

const baseSession: SessionState = {
  session_id: "s1",
  topic_label: "Languages",
  side_1: "english",
  side_2: "spanish",
  current_card: { card_id: "1", side_1_value: "dog", side_2_value: "perro" },
  is_flipped: false,
  current_index: 0,
  total_cards: 3,
  completed: false,
  can_go_previous: false,
  can_go_next: true,
};

describe("FlashcardView", () => {
  it("shows a prompt when there is no session", () => {
    render(<FlashcardView session={null} onFlip={vi.fn()} onNext={vi.fn()} onPrevious={vi.fn()} pending={false} />);
    expect(screen.getByText(/pick a topic/i)).toBeInTheDocument();
  });

  it("shows side 1 before flipping and calls onFlip when the card is clicked", () => {
    const onFlip = vi.fn();
    render(<FlashcardView session={baseSession} onFlip={onFlip} onNext={vi.fn()} onPrevious={vi.fn()} pending={false} />);
    expect(screen.getByText("dog")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("flashcard"));
    expect(onFlip).toHaveBeenCalled();
  });

  it("shows side 2 once flipped", () => {
    render(
      <FlashcardView
        session={{ ...baseSession, is_flipped: true }}
        onFlip={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        pending={false}
      />,
    );
    expect(screen.getByText("perro")).toBeInTheDocument();
  });

  it("shows a completion panel once the session is completed", () => {
    render(
      <FlashcardView
        session={{ ...baseSession, completed: true, current_card: null }}
        onFlip={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        pending={false}
      />,
    );
    expect(screen.getByText(/session complete/i)).toBeInTheDocument();
  });

  it("disables Previous/Next according to the session's bounds", () => {
    render(<FlashcardView session={baseSession} onFlip={vi.fn()} onNext={vi.fn()} onPrevious={vi.fn()} pending={false} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });
});
