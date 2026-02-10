"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WikiFrame } from "@/components/WikiFrame"; 
import { WikiHeader } from "@/components/WikiHeader";
import Link from "next/link";


function WikiViewerContent() {
  const searchParams = useSearchParams();
  const startWord = searchParams.get("start") || ""; 
  const goalWord = searchParams.get("goal") || "";

  const isCustomMode = !!(startWord && goalWord);
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [html, setHtml] = useState("");
  const [startPage, setStartPage] = useState("");
  const [goalPage, setGoalPage] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const handleUndo = () => {
    if (history.length <= 1) return;

    const newHistory = history.slice(0, -1);
    const previousPage = newHistory[newHistory.length - 1];

    setHistory(newHistory);
    setCurrentPage(previousPage);
    localStorage.setItem("wikiHistory", JSON.stringify(newHistory));
  };

  useEffect(() => {
    const fetchRandomPage = async () => {
      setIsLoading(true);
      if (!isCustomMode){
        try {
          const res = await fetch("https://ja.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*");
          const data = await res.json();
          const res2 = await fetch("https://ja.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*");
          const data2 = await res2.json();
          const title = data.query.random[0].title;
          const title2 = data2.query.random[0].title;
          setStartPage(title);
          setCurrentPage(title);
          setGoalPage(title2);
          setHistory([title]);
        } catch (e) {
          console.error("Failed to fetch random page", e);
        }
      }
      else{
        try {
          setStartPage(startWord);
          setCurrentPage(startWord);
          setGoalPage(goalWord);
          setHistory([startWord]);
        } catch (e) {
          console.error("Failed to fetch random page", e);
        }
      }
      setIsLoading(false);
    };
    fetchRandomPage();

  }, []); 

  useEffect(() => {
    if (!currentPage) return;
    const fetchWikiHtml = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`https://ja.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(currentPage)}`);
        const text = await res.text();
        setHtml(text);
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to fetch HTML", e);
        handleUndo();
      }
    };
    fetchWikiHtml();
  }, [currentPage]);

  const handleLinkClick = (href: string, title: string, text: string) => {
    

    const historyText = text || title || href;
    const newHistory = [...history, historyText];
    setHistory(newHistory);
    localStorage.setItem("wikiHistory", JSON.stringify(newHistory));

    const isWikiLink = href.startsWith("./") || href.includes("/wiki/");

    if (isWikiLink) {

      if (decodeURIComponent(href).includes(goalPage) || (title && title === goalPage)) {
         router.push("/Goal");
         return;
      }

      const nextTitle = title || href.replace(/^\.\//, "").replace("/wiki/", "");
      setCurrentPage(nextTitle);

    } else {
      window.open(href, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-6 text-gray-800"><Link href="./start-display">Wikipedia Golf</Link></h1>

        <WikiHeader StartTitle = {startPage} title={currentPage}  GoalTitle={goalPage} onUndo={handleUndo} canUndo={history.length > 1} />

        {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[70vh] border rounded-lg bg-gray-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-500 font-bold">読み込み中...</p>
        </div>
      ) : (
        <WikiFrame html={html} onLinkClick={handleLinkClick} />
      )}
        

        <div className="mt-4 text-xs text-gray-400">
          履歴数: {history.length}
        </div>
      </div>
    </div>
  );
}

export default function WikiViewer() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <WikiViewerContent />
    </Suspense>
  );
}