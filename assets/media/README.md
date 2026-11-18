# Photos and videos for the site

Drop files here with these exact names. Each one replaces its placeholder on the home page automatically.

| File | Where it appears | Shape |
|---|---|---|
| `hero.mp4` | Under the main headline: intro video (about 60 seconds) | wide, 16:9 |
| `team.jpg` | "Why" section: photo of the two partners | portrait, 4:5 |
| `behind-the-scenes.mp4` | "How" section: short video from building a real site | wide, 16:9 |
| `testimonial-1.mp4`, `testimonial-2.mp4`, `testimonial-3.mp4` | "What our clients say" | portrait, 4:5 or 9:16 |

Keep videos short and under about 20 MB each (compress to H.264 MP4).

After adding a file, also add its name to `manifest.json`, for example:

```json
{ "files": ["hero.mp4", "team.jpg"] }
```
