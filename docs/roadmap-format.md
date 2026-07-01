# Roadmap JSON Format

To prevent bloated SQL migrations and make roadmaps easier to build, Vurk uses a JSON-based Roadmap Import system.

## Schema Definition
All roadmaps must conform to this JSON schema:

```json
{
  "name": "Japanese N5",
  "version": 1,
  "duration_days": 180,
  "difficulty": "easy",
  "phases": [
    {
      "title": "Hiragana",
      "milestones": [
        {
          "title": "Master Basic Characters",
          "tasks": [
            {
              "title": "Learn あいうえお",
              "type": "reading",
              "difficulty": "easy",
              "estimated_minutes": 20,
              "submission_requirement": "photo",
              "requires_ai_verification": false,
              "xp_reward": 10
            }
          ]
        }
      ]
    }
  ]
}
```

## Validation Rules
The Roadmap Importer (`src/app/dashboard/admin`) will strictly reject files that fail validation:
1. **No Circular Dependencies:** Task dependencies must form a DAG.
2. **Valid Enums:** `difficulty`, `type`, and `submission_requirement` must exactly match the Postgres Enums.
3. **No Duplicate IDs:** If IDs are provided for tracking, they must be unique.
4. **Hierarchy Constraint:** Every roadmap MUST have at least one Phase, which has at least one Milestone, which has at least one Module/Task.
