from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console events and print them
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        try:
            page.goto("http://localhost:3000")

            # Wait for the table header to be visible, which indicates the table has been generated.
            header_id_element = page.get_by_role("columnheader", name="ID")
            expect(header_id_element).to_be_visible(timeout=10000) # 10 seconds timeout

            # Take a screenshot of the table container
            table_container = page.locator("#table-container")
            screenshot_path = "jules-scratch/verification/verification.png"
            table_container.screenshot(path=screenshot_path)

            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            # Check if the server process is still running before trying to kill it
            import subprocess
            try:
                subprocess.run(["kill", "%1"], check=True, shell=True)
            except subprocess.CalledProcessError:
                # Process already stopped
                pass
            browser.close()

if __name__ == "__main__":
    run()
