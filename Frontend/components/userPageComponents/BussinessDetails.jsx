import React, { useState, useEffect } from "react";
import { MdDeleteOutline, MdInfoOutline, MdOutlineEdit } from "react-icons/md";
import { FaRobot, FaCommentDots } from "react-icons/fa";
import {
  List,
  LayoutGrid,
  ChevronDown,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import { generateJSONContent } from "@/lib/groq";

import { CardHeader, CardTitle, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "components/ui/dialog";

import { useDispatch, useSelector } from "react-redux";
import {
  addBusinessDetails,
  updateBusinessDetails,
  deleteBusinessDetails,
  loadUser,
  clearState,
} from "@/slices/userSlice";
import toast from "react-hot-toast";
import { AiFillThunderbolt } from "react-icons/ai";
import Loader from "../Loader";

const BusinessDetails = () => {
  const dispatch = useDispatch();
  const [layout, setLayout] = useState("carousel");
  const {
    isBusinessDetailsAdded,
    isBusinessDetailsUpdated,
    isBusinessDetailsDeleted,
    user,
  } = useSelector((state) => state.user);

  // Dynamic Q&A list for adding multiple questions & answers at once
  const [qaList, setQaList] = useState([
    { id: 1, question: "", answer: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  // Edit state modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    question: "",
    answer: "",
  });

  const handleAddField = () => {
    setQaList((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), question: "", answer: "" },
    ]);
  };

  const handleRemoveField = (id) => {
    if (qaList.length > 1) {
      setQaList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleFieldChange = (id, fieldName, value) => {
    setQaList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [fieldName]: value } : item
      )
    );
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await dispatch(deleteBusinessDetails(id)).unwrap();
      toast.success("Business detail deleted successfully");
      await dispatch(loadUser());
    } catch (err) {
      toast.error(err?.message || "Failed to delete detail");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (detail) => {
    setEditFormData({
      id: detail._id,
      question: detail.question,
      answer: detail.answer,
    });
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.question.trim() || !editFormData.answer.trim()) {
      toast.error("Please fill out both question and answer");
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        updateBusinessDetails({
          id: editFormData.id,
          question: editFormData.question,
          answer: editFormData.answer,
        })
      ).unwrap();
      toast.success("Business detail updated successfully");
      setIsEditOpen(false);
      await dispatch(loadUser());
    } catch (err) {
      toast.error(err?.message || "Failed to update detail");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validPairs = qaList.filter(
      (item) => item.question.trim() !== "" && item.answer.trim() !== ""
    );

    if (validPairs.length === 0) {
      toast.error("Please fill in at least one question and answer");
      return;
    }

    setLoading(true);
    try {
      await dispatch(addBusinessDetails({ details: validPairs })).unwrap();
      toast.success(
        `${validPairs.length} detail(s) saved to database successfully`
      );
      setQaList([{ id: Date.now(), question: "", answer: "" }]);
      await dispatch(loadUser());
    } catch (err) {
      toast.error(err?.message || "Failed to add business details");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    const businessDetails = `
      Business Name: ${user?.bussinessName || "N/A"},
      Business Category: ${user?.bussinessCategory || "N/A"},
      Business Description: ${user?.bussinessDescription || "N/A"}
    `;

    const prompt = `Generate exactly 5 AI questions for the following business details from user perspective (end users) which a user can ask from a chatbot about the business: ${businessDetails}.

Please return an array of exactly 5 questions in JSON format. Each question should be an object with "question" and "answer" properties. Format: [{"question": "What are your business hours?", "answer": "We are open Monday to Friday 9 AM to 6 PM"}]`;

    try {
      const questions = await generateJSONContent(prompt);

      if (Array.isArray(questions)) {
        setGeneratedQuestions(questions);
      } else if (questions?.content && Array.isArray(questions.content)) {
        setGeneratedQuestions(questions.content);
      } else {
        setGeneratedQuestions([
          {
            question: "What services do you offer?",
            answer: `We specialize in ${user?.bussinessCategory || "various services"} and provide comprehensive solutions.`,
          },
          {
            question: "How can I contact you?",
            answer: "You can reach us through our contact form or customer support.",
          },
          {
            question: "What makes your business unique?",
            answer: user?.bussinessDescription || "We are committed to providing excellent service to our customers.",
          },
          {
            question: "What are your business hours?",
            answer: "We are typically open Monday to Friday, 9 AM to 6 PM.",
          },
          {
            question: "Do you offer custom pricing or packages?",
            answer: "Please reach out to our team to discuss custom pricing packages suited to your needs.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error generating AI questions:", error);
      toast.error("An error occurred while generating AI questions.");
      setGeneratedQuestions([
        {
          question: "What services do you offer?",
          answer: `We specialize in ${user?.bussinessCategory || "various services"} and provide comprehensive solutions.`,
        },
        {
          question: "How can I contact you?",
          answer: "You can reach us through our contact form or customer support.",
        },
      ]);
    }

    setLoading(false);
  };

  const handlePickQuestion = (questionObj) => {
    setQaList((prev) => {
      const emptyIndex = prev.findIndex(
        (item) => !item.question.trim() && !item.answer.trim()
      );
      if (emptyIndex !== -1) {
        const updated = [...prev];
        updated[emptyIndex] = {
          ...updated[emptyIndex],
          question: questionObj.question,
          answer: questionObj.answer,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            question: questionObj.question,
            answer: questionObj.answer,
          },
        ];
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    setGeneratedQuestions([]);
    toast.success("Question selected!");
  };

  const handleDropdownToggle = (index) => {
    setSelectedQuestionIndex(selectedQuestionIndex === index ? null : index);
  };

  const handleToggleLayout = (selectedLayout) => {
    setLayout(selectedLayout);
  };

  useEffect(() => {
    if (
      isBusinessDetailsAdded ||
      isBusinessDetailsUpdated ||
      isBusinessDetailsDeleted
    ) {
      dispatch(loadUser());
      dispatch(clearState());
    }
  }, [
    isBusinessDetailsAdded,
    isBusinessDetailsUpdated,
    isBusinessDetailsDeleted,
    dispatch,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-gray-700">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl relative z-10 transform transition-transform">
        <CardHeader className="flex justify-between p-6">
          <CardTitle className="text-2xl font-semibold text-black-500">
            Company Details
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 text-black hover:text-gray-400 transition-all">
                <MdInfoOutline className="text-2xl" />
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white text-gray-900 rounded-xl p-6 border border-gray-100 shadow-2xl max-w-md">
              <AlertDialogTitle className="text-lg font-semibold mb-2 text-gray-900">
                How to Provide Business Details
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                <p className="mb-4">
                  To help us train our models effectively, please provide
                  detailed answers to the following:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>
                    Enter business-related questions in the "Question" field.
                  </li>
                  <li>Provide comprehensive answers in the "Answer" field.</li>
                  <li>Click "+ Add Question & Answer" to add multiple questions at once.</li>
                </ul>
              </AlertDialogDescription>
              <div className="mt-4 flex justify-end space-x-2">
                <AlertDialogCancel className="bg-[#9e45f1] hover:bg-[#6c2794] text-white px-4 py-2 rounded-lg">
                  Close
                </AlertDialogCancel>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Dynamic Q&A fields without "Pair #1" badges */}
            <div className="space-y-6">
              {qaList.map((item, index) => (
                <div key={item.id} className="relative space-y-4 pt-2">
                  {qaList.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveField(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" /> Remove Question
                      </button>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor={`question-${item.id}`}
                      className="block text-sm font-medium"
                    >
                      Company Related Question
                    </label>
                    <div className="relative">
                      <Input
                        id={`question-${item.id}`}
                        name="question"
                        value={item.question}
                        onChange={(e) =>
                          handleFieldChange(item.id, "question", e.target.value)
                        }
                        required={index === 0}
                        placeholder="What is our Company Objective? 🚀"
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) =>
                          (e.target.placeholder =
                            "What is our Company Objective? 🚀")
                        }
                        className="mt-2 block w-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring focus:ring-blue-500"
                      />
                      <FaRobot className="absolute right-3 top-3 text-xl text-[#9e45f1]" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`answer-${item.id}`}
                      className="block text-sm font-medium"
                    >
                      Answer
                    </label>
                    <div className="relative">
                      <Textarea
                        id={`answer-${item.id}`}
                        name="answer"
                        value={item.answer}
                        onChange={(e) =>
                          handleFieldChange(item.id, "answer", e.target.value)
                        }
                        required={index === 0}
                        placeholder="Our objective is to provide the best services to our customers... 💼"
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) =>
                          (e.target.placeholder =
                            "Our objective is to provide the best services to our customers... 💼")
                        }
                        rows={4}
                        className="mt-2 block w-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400"
                      />
                      <FaCommentDots className="absolute right-3 top-3 text-xl text-[#9e45f1]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single "+ Add Question & Answer" button */}
            <Button
              type="button"
              onClick={handleAddField}
              variant="outline"
              className="w-full py-2.5 text-md font-semibold border-2 border-[#9e45f1] text-[#9e45f1] hover:bg-[#9e45f1] hover:text-white transition-all flex items-center justify-center gap-2 bg-transparent"
            >
              <Plus className="w-5 h-5" /> Add Question & Answer
            </Button>

            {/* Generate with AI Button */}
            <Button
              type="button"
              onClick={handleGenerateAI}
              className="w-full py-3 text-lg font-semibold bg-neon transition-all relative text-white bg-purple-600"
              style={{
                background:
                  "linear-gradient(90deg, #FF00FF 0%, #FFA500 100%)",
              }}
            >
              <AiFillThunderbolt className="text-xl mr-2" /> Generate with AI
            </Button>

            {/* Display AI-generated Questions */}
            {generatedQuestions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">
                  AI-Generated Questions
                </h3>
                <div className="space-y-2">
                  {generatedQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="bg-white shadow-xl p-4 rounded-lg"
                    >
                      <div
                        className="flex justify-between cursor-pointer"
                        onClick={() => handleDropdownToggle(index)}
                      >
                        <h4 className="font-semibold">{question.question}</h4>
                        <span className="text-gray-400">
                          {selectedQuestionIndex === index ? "▲" : "▼"}
                        </span>
                      </div>
                      {selectedQuestionIndex === index && (
                        <div className="mt-2 text-gray-600">
                          {question.answer}
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={() => handlePickQuestion(question)}
                        className="mt-2 bg-[#9e45f1] hover:bg-[#6c2794] rounded-xl text-white"
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold bg-[#9e45f1] hover:bg-[#6c2794] text-white"
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </div>

      {/* Saved Questions List/Carousel */}
      <div className="w-full max-w-4xl mt-8">
        <div className="p-4">
          {/* Layout Toggle Icons */}
          <div className="flex justify-end mb-4 space-x-4">
            <LayoutGrid
              onClick={() => handleToggleLayout("carousel")}
              className={`cursor-pointer text-gray-500 hover:text-[#9e45f1] transition ${
                layout === "carousel" ? "text-[#9e45f1]" : ""
              }`}
              size={24}
            />
            <List
              onClick={() => handleToggleLayout("accordion")}
              className={`cursor-pointer text-gray-500 hover:text-[#9e45f1] transition ${
                layout === "accordion" ? "text-[#9e45f1]" : ""
              }`}
              size={24}
            />
          </div>

          {/* Conditionally render based on selected layout */}
          {layout === "carousel" ? (
            <div className="w-full max-w-4xl mt-8">
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 3000,
                  }),
                ]}
                className="rounded-xl shadow-xl overflow-hidden relative"
              >
                <CarouselContent>
                  {user?.bussinessDetails?.map((item, index) => (
                    <CarouselItem key={item._id || index}>
                      <div className="relative p-6 bg-white text-gray-800 rounded-xl transition-transform transform hover:scale-105 max-h-[35vh] min-h-[35vh]">
                        <div className="h-full relative group">
                          <CardHeader className="flex flex-row align-middle gap-3 pr-20">
                            <FaRobot className="text-2xl text-[#9e45f1] shrink-0" />
                            <CardTitle className="text-lg">
                              {item.question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <p>{item.answer}</p>
                          </CardContent>
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 text-[#9e45f1] hover:text-[#6c2794] transition-all"
                              title="Edit Question"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  className="p-2 text-red-500 hover:text-red-700 transition-all"
                                  title="Delete Question"
                                >
                                  <MdDeleteOutline className="text-2xl" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white text-gray-900 rounded-xl p-6 border border-gray-100 shadow-2xl max-w-md">
                                <AlertDialogTitle className="text-lg font-semibold mb-2 text-gray-900">
                                  Delete Confirmation
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Are you sure you want to delete this question detail from your database?
                                </AlertDialogDescription>
                                <div className="mt-6 flex justify-end space-x-3">
                                  <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-medium px-4 py-2 rounded-lg">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          ) : (
            <div className="accordion space-y-4">
              {user?.bussinessDetails?.map((detail, index) => (
                <div key={detail._id || index} className="border rounded-lg bg-white">
                  <div
                    onClick={() => {
                      const panel = document.getElementById(`panel-${index}`);
                      if (panel) panel.classList.toggle("hidden");
                    }}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <button className="w-full text-left font-medium text-gray-800 pr-4">
                      {detail.question}
                    </button>
                    <span className="flex items-center gap-3 shrink-0">
                      <Pencil
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(detail);
                        }}
                        className="w-4 h-4 text-[#9e45f1] hover:text-[#6c2794] z-50 cursor-pointer"
                        title="Edit Question"
                      />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Trash2
                            onClick={(e) => e.stopPropagation()}
                            color="red"
                            className="w-4 h-4 z-50 cursor-pointer hover:opacity-80"
                            title="Delete Question"
                          />
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white text-gray-900 rounded-xl p-6 border border-gray-100 shadow-2xl max-w-md">
                          <AlertDialogTitle className="text-lg font-semibold mb-2 text-gray-900">
                            Delete Confirmation
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Are you sure you want to delete this question detail from your database?
                          </AlertDialogDescription>
                          <div className="mt-6 flex justify-end space-x-3">
                            <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-medium px-4 py-2 rounded-lg">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(detail._id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>

                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </span>
                  </div>
                  <div
                    id={`panel-${index}`}
                    className="px-4 py-3 bg-white hidden rounded-b-lg border-t text-gray-700 text-sm"
                  >
                    <p>{detail.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal aligned with Theme */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white text-gray-900 max-w-lg rounded-xl p-6 shadow-2xl border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MdOutlineEdit className="text-[#9e45f1] text-2xl" /> Edit Company Question
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Update the question and answer stored in your database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="edit-question" className="block text-sm font-medium">
                Company Related Question
              </label>
              <div className="relative mt-2">
                <Input
                  id="edit-question"
                  value={editFormData.question}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  required
                  className="mt-2 block w-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring focus:ring-blue-500"
                />
                <FaRobot className="absolute right-3 top-3 text-xl text-[#9e45f1]" />
              </div>
            </div>

            <div>
              <label htmlFor="edit-answer" className="block text-sm font-medium">
                Answer
              </label>
              <div className="relative mt-2">
                <Textarea
                  id="edit-answer"
                  value={editFormData.answer}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      answer: e.target.value,
                    }))
                  }
                  required
                  rows={4}
                  className="mt-2 block w-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400"
                />
                <FaCommentDots className="absolute right-3 top-3 text-xl text-[#9e45f1]" />
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2 pt-4 border-t border-gray-100 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-medium px-4 py-2 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#9e45f1] hover:bg-[#6c2794] text-white px-5 py-2 rounded-lg font-semibold"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessDetails;
