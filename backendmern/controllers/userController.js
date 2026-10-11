import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const search =
      req.query.search?.trim() || "";

    const query = {
      _id: {
        $ne: req.user._id,
      },
    };

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          username: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const users = await User.find(query)
      .select(
        "name username email avatar bio isOnline lastSeen"
      )
      .sort({
        isOnline: -1,
        name: 1,
      })
      .limit(30);

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};

export const getUserById = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select(
      "name username email avatar bio isOnline lastSeen"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch user",
    });
  }
};