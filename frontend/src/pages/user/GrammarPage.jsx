import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import {
  getGrammarErrorMessage,
  getGrammarsRequest,
} from "../../api/grammars";
import { getTopicErrorMessage, getTopicRequest } from "../../api/topics";
import useSpeak from "../../hooks/useSpeak";

export default function GrammarPage() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [grammars, setGrammars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [voiceNoticeId, setVoiceNoticeId] = useState("");
  const { speak, available: speechAvailable } = useSpeak();

  useEffect(() => {
    let active = true;

    async function loadGrammarPage() {
      setIsLoading(true);
      setErrorMessage("");
      setTopic(null);
      setGrammars([]);
      let topicLoaded = false;

      try {
        const topicData = await getTopicRequest(topicId);
        if (!active) return;
        topicLoaded = true;
        setTopic(topicData);

        const grammarData = await getGrammarsRequest(topicId);
        if (active) setGrammars(Array.isArray(grammarData) ? grammarData : []);
      } catch (error) {
        if (active) {
          setErrorMessage(
            topicLoaded
              ? getGrammarErrorMessage(error)
              : getTopicErrorMessage(error),
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadGrammarPage();
    return () => {
      active = false;
    };
  }, [topicId]);

  const goBack = (
    <Link
      to="/topics"
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Về danh sách chủ đề
    </Link>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 md:px-6">
      <div className="mb-6">{goBack}</div>

      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Đang tải...
        </p>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-red-100 bg-white p-6">
          <p role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
          <div className="mt-4">{goBack}</div>
        </div>
      ) : (
        <>
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Ngữ pháp tiếng Hàn
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {topic?.name}
            </h1>
            {topic?.description && (
              <p className="mt-2 text-sm text-gray-500">{topic.description}</p>
            )}
          </header>

          {grammars.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-sm text-gray-600">
                Chủ đề này hiện chưa có nội dung ngữ pháp.
              </p>
              <div className="mt-5">{goBack}</div>
            </div>
          ) : (
            <div className="space-y-4">
              {grammars.map((grammar) => (
                <article
                  key={grammar.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <h2 className="text-lg font-bold text-emerald-700">
                    {grammar.title}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                    {grammar.content}
                  </p>

                  {grammar.examples?.length > 0 && (
                    <section className="mt-5 border-t border-gray-100 pt-4">
                      <h3 className="mb-3 text-xs font-semibold text-gray-700">
                        Ví dụ
                      </h3>
                      <div className="space-y-3">
                        {grammar.examples.map((example) => {
                          const noticeId = `${grammar.id}-${example.id}`;
                          return (
                            <div
                              key={example.id}
                              className="rounded-xl bg-gray-50 p-4"
                            >
                              <div className="flex items-start gap-2">
                                <p className="flex-1 text-base font-semibold text-gray-900">
                                  {example.korean}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (speechAvailable) {
                                      setVoiceNoticeId("");
                                      speak(example.korean);
                                    } else {
                                      setVoiceNoticeId(noticeId);
                                    }
                                  }}
                                  aria-label="Nghe câu tiếng Hàn"
                                  className={`rounded-lg p-1.5 text-emerald-700 transition hover:bg-emerald-100 ${
                                    speechAvailable ? "" : "opacity-50"
                                  }`}
                                >
                                  <Volume2 className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {example.meaning}
                              </p>
                              {!speechAvailable &&
                                voiceNoticeId === noticeId && (
                                  <p
                                    role="status"
                                    className="mt-2 text-xs leading-relaxed text-gray-500"
                                  >
                                    Thiết bị của bạn chưa có giọng đọc tiếng
                                    Hàn. Hãy thử trình duyệt Microsoft Edge hoặc
                                    cài thêm giọng Korean trong cài đặt giọng
                                    nói của hệ điều hành.
                                  </p>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
