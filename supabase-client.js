/* Shared Supabase loader for AlphaScript.
   Tries two CDNs so one blocked CDN does not break authentication. */
(() => {
  "use strict";

  const SUPABASE_URL = "https://qaivqscssdtsnthdiqtu.supabase.co";
  const SUPABASE_KEY = "sb_publishable_TjT6PMScm58zNVJiugk-zQ_6oIaJNU9";

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load " + src));
      document.head.appendChild(script);
    });
  }

  async function createClient() {
    if (!window.supabase?.createClient) {
      const cdns = [
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
        "https://unpkg.com/@supabase/supabase-js@2"
      ];
      let lastError;
      for (const cdn of cdns) {
        try {
          await loadScript(cdn);
          if (window.supabase?.createClient) break;
        } catch (error) {
          lastError = error;
        }
      }
    }

    if (!window.supabase?.createClient) {
      throw new Error(
        "The Supabase client library could not load. Check your internet connection, then refresh the page."
      );
    }

    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  window.alphaSupabaseReady = createClient();
})();
